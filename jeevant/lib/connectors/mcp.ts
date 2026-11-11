// Minimal MCP client over the Streamable HTTP transport.
//
// Supported: initialize, notifications/initialized, tools/list (with cursor),
// tools/call. JSON and text/event-stream responses are both handled. Session
// IDs are captured from the initialize response and reused for the call.
//
// Not supported yet: stdio servers, OAuth discovery, resources/prompts,
// server-initiated notifications. Those can be added without changing callers.

import { assertHttpUrl, connectorFetch } from "./http";
import type { ConnectorAuth, RemoteCallResult, RemoteTool } from "./types";

type JsonRpc = {
  jsonrpc: "2.0";
  id?: number;
  method?: string;
  params?: unknown;
  result?: any;
  error?: { code?: number; message?: string; data?: unknown };
};

type RpcOptions = {
  url: string;
  auth?: ConnectorAuth;
  timeoutMs?: number;
};

const PROTOCOL_VERSION = "2024-11-05";

function parseSse(text: string, expectedId?: number): any {
  const blocks = text.split(/\r?\n\r?\n/);
  const parsed: any[] = [];
  for (const block of blocks) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .join("\n");
    if (!data) continue;
    try {
      parsed.push(JSON.parse(data));
    } catch {
      // A partial or non-JSON event is not a response we can use.
    }
  }
  if (!parsed.length) return null;
  if (expectedId === undefined) return parsed[parsed.length - 1];
  const match = parsed.find((item) => item?.id === expectedId);
  return match || parsed[parsed.length - 1];
}

function responseText(value: any): string {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

async function rpc(
  options: RpcOptions,
  method: string,
  params: unknown,
  id: number,
  sessionId?: string
): Promise<{ result: any; sessionId: string }> {
  const url = assertHttpUrl(options.url);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) headers["mcp-session-id"] = sessionId;

  const res = await connectorFetch(
    url.toString(),
    {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    },
    options.auth,
    options.timeoutMs
  );

  const nextSession = res.headers.get("mcp-session-id") || sessionId || "";
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`MCP ${res.status}: ${text.slice(0, 240) || res.statusText}`);
  }
  if (!text.trim()) throw new Error(`MCP returned an empty response to ${method}.`);

  const contentType = res.headers.get("content-type") || "";
  let payload: JsonRpc | null = null;
  if (
    contentType.includes("text/event-stream") ||
    text.trimStart().startsWith("event:") ||
    text.trimStart().startsWith("data:")
  ) {
    payload = parseSse(text, id);
  } else {
    try {
      const parsed = JSON.parse(text);
      payload = Array.isArray(parsed) ? parsed.find((item) => item?.id === id) || parsed[0] : parsed;
    } catch {
      payload = parseSse(text, id);
    }
  }

  if (!payload) throw new Error(`MCP returned an unreadable response to ${method}.`);
  if (payload.error) {
    throw new Error(`MCP ${method} failed: ${payload.error.message || payload.error.code || "unknown error"}`);
  }
  return { result: payload.result, sessionId: nextSession };
}

async function notifyInitialized(options: RpcOptions, sessionId: string): Promise<void> {
  try {
    const url = assertHttpUrl(options.url);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionId) headers["mcp-session-id"] = sessionId;
    await connectorFetch(
      url.toString(),
      {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      },
      options.auth,
      options.timeoutMs
    );
  } catch {
    // Some servers do not implement the notification; the tools call still works.
  }
}

async function initialize(options: RpcOptions): Promise<string> {
  const { sessionId } = await rpc(
    options,
    "initialize",
    {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "jeevant", version: "0.8.0" },
    },
    1
  );
  await notifyInitialized(options, sessionId);
  return sessionId;
}

function riskFor(annotations: Record<string, unknown>): RemoteTool["risk"] {
  if (annotations.destructiveHint === true) return "destructive";
  if (annotations.readOnlyHint === true) return "read";
  return "external";
}

export async function listMcpTools(options: RpcOptions): Promise<RemoteTool[]> {
  let sessionId = await initialize(options);
  const tools: RemoteTool[] = [];
  let cursor: string | undefined;
  let id = 2;

  for (let page = 0; page < 20; page++) {
    const response = await rpc(
      options,
      "tools/list",
      cursor ? { cursor } : {},
      id++,
      sessionId
    );
    const result = response.result;
    sessionId = response.sessionId || sessionId;
    const items = Array.isArray(result?.tools) ? result.tools : [];
    for (const item of items) {
      const name = String(item?.name || "").trim();
      if (!name) continue;
      const annotations =
        item?.annotations && typeof item.annotations === "object"
          ? (item.annotations as Record<string, unknown>)
          : {};
      tools.push({
        name,
        description: String(item?.description || item?.title || name),
        inputSchema:
          item?.inputSchema && typeof item.inputSchema === "object"
            ? (item.inputSchema as Record<string, unknown>)
            : { type: "object", properties: {} },
        risk: riskFor(annotations),
      });
      if (tools.length >= 200) return tools;
    }
    cursor = typeof result?.nextCursor === "string" ? result.nextCursor : undefined;
    if (!cursor || !items.length) break;
  }

  return tools;
}

export async function callMcpTool(
  options: RpcOptions,
  toolName: string,
  args: Record<string, unknown>
): Promise<RemoteCallResult> {
  try {
    const sessionId = await initialize(options);
    const { result } = await rpc(
      options,
      "tools/call",
      { name: toolName, arguments: args || {} },
      2,
      sessionId
    );

    const content = Array.isArray(result?.content) ? result.content : [];
    const chunks: string[] = [];
    for (const item of content) {
      if (item?.type === "text" && typeof item.text === "string") chunks.push(item.text);
      else if (item?.type === "image") chunks.push("[image result]");
      else if (item?.type === "resource") chunks.push(responseText(item.resource || item));
      else chunks.push(responseText(item));
    }

    const text = chunks.filter(Boolean).join("\n") || responseText(result?.structuredContent ?? result);
    return {
      ok: result?.isError !== true,
      result: text.slice(0, 20_000) || "MCP tool returned an empty result.",
      data: result,
    };
  } catch (error) {
    return { ok: false, result: (error as Error).message };
  }
}
