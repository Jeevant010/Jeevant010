// Connector persistence + dynamic registry loading.
//
// Connectors are refreshed lazily (30s cache) before planning, and immediately
// after a create/sync/delete. Secrets are decrypted only inside the executor.

import connectDB from "@/lib/db";
import { Connector } from "@/lib/database/models";
import { openSecrets } from "@/lib/crypto/secrets";
import { registerDynamicTools, type ToolEntry, type ToolRisk } from "@/lib/agent/registry";
import type { ConnectorAuth, ConnectorConfig, ConnectorKind, RemoteTool } from "./types";

const CACHE_MS = 30_000;
let loadedAt = 0;
let inflight: Promise<void> | null = null;

function slug(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export function dynamicToolName(connectorName: string, remoteName: string): string {
  const connector = slug(connectorName) || "connector";
  const remote = slug(remoteName) || "tool";
  return `${connector}__${remote}`.slice(0, 96);
}

export function connectorAuth(doc: any): ConnectorAuth {
  const secrets = openSecrets(doc?.secrets);
  return {
    type: doc?.authType === "bearer" || doc?.authType === "header" ? doc.authType : "none",
    header: String(doc?.authHeader || ""),
    token: String(secrets.token || secrets.apiKey || ""),
  };
}

export function connectorConfig(doc: any): ConnectorConfig {
  return {
    name: String(doc?.name || ""),
    kind: doc?.kind === "openapi" ? "openapi" : "mcp",
    url: String(doc?.url || ""),
    auth: connectorAuth(doc),
  };
}

export function publicConnector(doc: any) {
  const tools = Array.isArray(doc?.tools) ? doc.tools : [];
  return {
    _id: String(doc?._id || ""),
    name: String(doc?.name || ""),
    kind: doc?.kind === "openapi" ? "openapi" : "mcp",
    url: String(doc?.url || ""),
    authType: doc?.authType || "none",
    authHeader: doc?.authHeader || "",
    enabled: doc?.enabled !== false,
    risk: doc?.risk || "external",
    toolCount: tools.length,
    tools: tools.map((tool: RemoteTool) => ({
      name: tool.name,
      description: tool.description,
      risk: tool.risk,
      method: tool.method,
      path: tool.path,
    })),
    lastSyncedAt: doc?.lastSyncedAt || null,
    lastError: doc?.lastError || "",
    createdAt: doc?.createdAt || null,
  };
}

function entryFor(doc: any, tool: RemoteTool): ToolEntry {
  const fullName = dynamicToolName(doc.name, tool.name);
  const schema = tool.inputSchema && typeof tool.inputSchema === "object" ? tool.inputSchema : {};
  const schemaText = JSON.stringify(schema);
  const description = String(tool.description || `${doc.kind} tool ${tool.name}`).slice(0, 600);
  const tags = Array.from(
    new Set([
      ...fullName.split("_"),
      ...String(doc.name).toLowerCase().split(/[^a-z0-9]+/),
      String(doc.kind).toLowerCase(),
      ...description.toLowerCase().match(/[a-z0-9_]+/g) || [],
    ])
  ).filter(Boolean);

  const risk: ToolRisk =
    tool.risk === "read" || tool.risk === "write" || tool.risk === "destructive"
      ? tool.risk
      : "external";

  return {
    name: fullName,
    args: schemaText,
    description,
    tags,
    risk,
    core: false,
    line: `${fullName} args: ${schemaText.slice(0, 800)} // ${description}`,
    inputSchema: schema,
    dynamic: {
      connectorId: String(doc._id),
      connectorName: String(doc.name),
      kind: doc.kind === "openapi" ? "openapi" : "mcp",
      remoteName: String(tool.name),
      method: tool.method,
      path: tool.path,
      queryParams: Array.isArray(tool.queryParams) ? tool.queryParams : [],
      bodyMode: tool.bodyMode || "none",
      baseUrl: String(doc.baseUrl || doc.url || ""),
    },
  };
}

export async function refreshConnectorRegistry(force = false): Promise<void> {
  if (!force && Date.now() - loadedAt < CACHE_MS) return;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      await connectDB();
      const docs = await Connector.find({ enabled: true }).lean();
      const entries: ToolEntry[] = [];
      const seen = new Set<string>();
      for (const doc of docs as any[]) {
        const tools = Array.isArray(doc.tools) ? doc.tools : [];
        for (const tool of tools) {
          const entry = entryFor(doc, tool);
          if (seen.has(entry.name)) continue;
          seen.add(entry.name);
          entries.push(entry);
        }
      }
      registerDynamicTools(entries);
      loadedAt = Date.now();
    } catch {
      // Keep the previous dynamic set if the database is briefly unavailable.
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export async function getConnectorByName(name: string): Promise<any | null> {
  const clean = String(name || "").trim().toLowerCase();
  if (!clean) return null;
  await connectDB();
  return Connector.findOne({ name: clean });
}

export async function getConnectorById(id: string): Promise<any | null> {
  if (!/^[a-f0-9]{24}$/i.test(String(id || ""))) return null;
  await connectDB();
  return Connector.findById(id);
}

export function normalizeConnectorName(value: unknown): string {
  return slug(String(value || ""));
}

export function isConnectorKind(value: unknown): value is ConnectorKind {
  return value === "mcp" || value === "openapi";
}

export function hostOf(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}
