// Execution layer for dynamic connectors.
//
// Read-only operations run directly (audited). Anything that can mutate state
// is queued as an Approval; the approval executor resolves credentials again
// server-side. Auth tokens never enter the model prompt or an approval payload.

import { Approval } from "@/lib/database/models";
import { audit, evaluateExternalAction, getGuardrailSettings } from "@/lib/guardrails/policy";
import type { ToolEntry, ToolRisk } from "@/lib/agent/registry";
import { assertHttpUrl, connectorFetch, safeHeaderEntries } from "./http";
import { buildOpenApiRequest } from "./openapi";
import { callMcpTool } from "./mcp";
import { connectorAuth, getConnectorByName, hostOf } from "./store";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const ALLOWED_METHODS = new Set(["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"]);

type HttpResult = { ok: boolean; result: string; data?: unknown };

function responseSummary(status: number, ok: boolean, text: string): HttpResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = undefined;
  }
  const body = text.trim();
  const detail = body ? body.slice(0, 6000) : "(empty response)";
  return {
    ok,
    result: `HTTP ${status}: ${detail}`,
    data,
  };
}

function bodyFor(method: string, body: unknown, headers: Record<string, string>): BodyInit | undefined {
  if (READ_METHODS.has(method) || body === undefined || body === null) return undefined;
  headers["Content-Type"] = headers["Content-Type"] || "application/json";
  return typeof body === "string" ? body : JSON.stringify(body);
}

async function perform(
  url: string,
  method: string,
  body: unknown,
  headers: Record<string, string>,
  auth?: ReturnType<typeof connectorAuth>
): Promise<HttpResult> {
  const outgoing = { ...headers };
  const payload = bodyFor(method, body, outgoing);
  const res = await connectorFetch(
    url,
    {
      method,
      headers: { Accept: "application/json, text/plain, */*", ...outgoing },
      body: payload,
    },
    auth,
    30_000
  );
  const text = await res.text();
  return responseSummary(res.status, res.ok, text);
}

async function queueHttp(
  doc: any | null,
  method: string,
  url: string,
  body: unknown,
  headers: Record<string, string>,
  allowedHosts: string[],
  label: string
): Promise<HttpResult> {
  const guard = await evaluateExternalAction({
    kind: "http",
    target: url,
    meta: { connector: doc?.name || "", allowedHosts },
  });
  if (!guard.allowed) return { ok: false, result: guard.reason };

  const approval = await Approval.create({
    kind: "http",
    title: `${label}: ${method} ${new URL(url).host}${new URL(url).pathname}`,
    detail: doc ? `Connector ${doc.name}` : "Generic HTTP request",
    payload: {
      connector: doc?.name || "",
      method,
      url,
      body,
      headers,
      allowedHosts,
    },
    status: "pending",
  });

  return {
    ok: true,
    result: `Queued ${method} ${new URL(url).host}${new URL(url).pathname} for approval. Nothing sent yet.`,
    data: { approvalId: String(approval._id) },
  };
}

function riskForMethod(method: string): ToolRisk {
  if (READ_METHODS.has(method)) return "read";
  if (method === "DELETE") return "destructive";
  return "external";
}

async function queueMcp(doc: any, toolName: string, args: Record<string, unknown>): Promise<HttpResult> {
  const guard = await evaluateExternalAction({
    kind: "mcp",
    target: `${doc.name}/${toolName}`,
    meta: { connector: doc.name, risk: "external" },
  });
  if (!guard.allowed) return { ok: false, result: guard.reason };

  const approval = await Approval.create({
    kind: "mcp",
    title: `${doc.name}: ${toolName}`,
    detail: JSON.stringify(args || {}).slice(0, 1200),
    payload: { connector: doc.name, tool: toolName, args: args || {} },
    status: "pending",
  });

  return {
    ok: true,
    result: `Queued MCP tool "${toolName}" on ${doc.name} for approval. Nothing ran yet.`,
    data: { approvalId: String(approval._id) },
  };
}

export async function executeDynamicTool(entry: ToolEntry, args: Record<string, unknown>): Promise<HttpResult> {
  if (!entry.dynamic) return { ok: false, result: `Unknown tool "${entry.name}".` };
  const doc = await getConnectorByName(entry.dynamic.connectorName);
  if (!doc) return { ok: false, result: `Connector "${entry.dynamic.connectorName}" no longer exists.` };
  if (doc.enabled === false) return { ok: false, result: `Connector "${doc.name}" is disabled.` };

  if (entry.dynamic.kind === "mcp") {
    if (entry.risk !== "read") {
      return queueMcp(doc, entry.dynamic.remoteName, args || {});
    }
    const result = await callMcpTool(
      { url: String(doc.url), auth: connectorAuth(doc) },
      entry.dynamic.remoteName,
      args || {}
    );
    await audit(
      { kind: "mcp", target: `${doc.name}/${entry.dynamic.remoteName}`, meta: { risk: entry.risk } },
      result.ok ? "executed" : "failed",
      result.result
    );
    return result;
  }

  const request = buildOpenApiRequest(
    {
      method: entry.dynamic.method || "GET",
      path: entry.dynamic.path || "/",
      queryParams: entry.dynamic.queryParams || [],
      bodyMode: entry.dynamic.bodyMode || "none",
    },
    String(doc.baseUrl || entry.dynamic.baseUrl || doc.url),
    args || {}
  );
  const url = assertHttpUrl(request.url);
  const allowedHosts = [url.hostname.toLowerCase(), hostOf(String(doc.baseUrl || doc.url))].filter(Boolean);
  const method = request.method.toUpperCase();

  if (entry.risk === "read") {
    const result = await perform(url.toString(), method, request.body, {}, connectorAuth(doc));
    await audit(
      { kind: "http", target: url.toString(), meta: { connector: doc.name, risk: entry.risk } },
      result.ok ? "executed" : "failed",
      result.result
    );
    return result;
  }

  return queueHttp(doc, method, url.toString(), request.body, {}, allowedHosts, doc.name);
}

export async function executeHttpRequest(args: Record<string, unknown>): Promise<HttpResult> {
  const method = String(args?.method || "GET").toUpperCase();
  if (!ALLOWED_METHODS.has(method)) {
    return { ok: false, result: "Method must be GET, HEAD, OPTIONS, POST, PUT, PATCH, or DELETE." };
  }

  let url: URL;
  try {
    url = assertHttpUrl(String(args?.url || ""));
  } catch (error) {
    return { ok: false, result: (error as Error).message };
  }

  const body = args?.body;
  if (body !== undefined && JSON.stringify(body).length > 100_000) {
    return { ok: false, result: "HTTP body is too large (100KB limit)." };
  }

  const headers = safeHeaderEntries(args?.headers);
  const connectorName = String(args?.connector || "").trim();
  const risk = riskForMethod(method);

  if (connectorName) {
    const doc = await getConnectorByName(connectorName);
    if (!doc) return { ok: false, result: `No connector named "${connectorName}".` };
    if (doc.enabled === false) return { ok: false, result: `Connector "${doc.name}" is disabled.` };
    const baseHost = hostOf(String(doc.baseUrl || doc.url));
    if (!baseHost || url.hostname.toLowerCase() !== baseHost) {
      return { ok: false, result: `That URL is not on connector "${doc.name}"'s host (${baseHost || "unknown"}).` };
    }
    const allowedHosts = [url.hostname.toLowerCase(), baseHost].filter(Boolean);

    if (risk === "read") {
      const result = await perform(url.toString(), method, undefined, headers, connectorAuth(doc));
      await audit(
        { kind: "http", target: url.toString(), meta: { connector: doc.name } },
        result.ok ? "executed" : "failed",
        result.result
      );
      return result;
    }

    return queueHttp(doc, method, url.toString(), body, headers, allowedHosts, doc.name);
  }

  const settings = await getGuardrailSettings();
  const allowlist = settings.httpAllowlist
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (!allowlist.includes(url.hostname.toLowerCase())) {
    return {
      ok: false,
      result: `HTTP host "${url.hostname}" is not in the guardrail allowlist. Add it in Guardrails first.`,
    };
  }

  if (risk === "read") {
    const result = await perform(url.toString(), method, undefined, headers);
    await audit(
      { kind: "http", target: url.toString(), meta: { generic: true } },
      result.ok ? "executed" : "failed",
      result.result
    );
    return result;
  }

  return queueHttp(null, method, url.toString(), body, headers, [url.hostname.toLowerCase()], "HTTP");
}

// Called by the approval executor. The connector's sealed secret is decrypted
// here, not stored in the approval document.
export async function executeApprovedMcpCall(payload: any): Promise<{ ok: boolean; detail: string }> {
  const name = String(payload?.connector || "").trim();
  const toolName = String(payload?.tool || "").trim();
  const doc = await getConnectorByName(name);
  if (!doc) return { ok: false, detail: `Connector "${name}" no longer exists.` };
  if (doc.enabled === false) return { ok: false, detail: `Connector "${name}" is disabled.` };
  if (!toolName) return { ok: false, detail: "No MCP tool name in this approval." };

  const result = await callMcpTool(
    { url: String(doc.url), auth: connectorAuth(doc) },
    toolName,
    payload?.args && typeof payload.args === "object" ? payload.args : {}
  );
  await audit(
    { kind: "mcp", target: `${doc.name}/${toolName}`, meta: { approved: true } },
    result.ok ? "executed" : "failed",
    result.result
  );
  return { ok: result.ok, detail: result.result };
}

export async function executeApprovedConnectorRequest(payload: any): Promise<{ ok: boolean; detail: string }> {
  const name = String(payload?.connector || "").trim();
  const doc = await getConnectorByName(name);
  if (!doc) return { ok: false, detail: `Connector "${name}" no longer exists.` };
  if (doc.enabled === false) return { ok: false, detail: `Connector "${name}" is disabled.` };

  const url = assertHttpUrl(String(payload?.url || ""));
  const baseHost = hostOf(String(doc.baseUrl || doc.url));
  if (!baseHost || url.hostname.toLowerCase() !== baseHost) {
    return { ok: false, detail: `The URL host no longer matches connector "${name}".` };
  }

  const method = String(payload?.method || "POST").toUpperCase();
  if (!ALLOWED_METHODS.has(method)) return { ok: false, detail: `Unsupported method ${method}.` };

  const result = await perform(
    url.toString(),
    method,
    payload?.body,
    safeHeaderEntries(payload?.headers),
    connectorAuth(doc)
  );
  await audit(
    { kind: "http", target: url.toString(), meta: { connector: doc.name, approved: true } },
    result.ok ? "executed" : "failed",
    result.result
  );
  return { ok: result.ok, detail: result.result };
}
