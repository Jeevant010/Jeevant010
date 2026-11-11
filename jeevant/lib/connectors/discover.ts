import { listMcpTools } from "./mcp";
import { loadOpenApi, type OpenApiTool } from "./openapi";
import type { ConnectorConfig, ConnectorRisk, DiscoveredConnector, RemoteTool } from "./types";

const RANK: Record<ConnectorRisk, number> = {
  read: 0,
  write: 1,
  external: 2,
  destructive: 3,
};

export function highestRisk(tools: RemoteTool[]): ConnectorRisk {
  return tools.reduce<ConnectorRisk>(
    (highest, tool) => (RANK[tool.risk] > RANK[highest] ? tool.risk : highest),
    "read"
  );
}

export async function discoverTools(config: ConnectorConfig): Promise<DiscoveredConnector> {
  if (config.kind === "mcp") {
    const tools = await listMcpTools({ url: config.url, auth: config.auth });
    if (!tools.length) throw new Error("The MCP server returned no tools.");
    return { tools, baseUrl: config.url, title: config.name || "MCP server" };
  }

  const result = await loadOpenApi({ url: config.url, auth: config.auth });
  if (!result.tools.length) throw new Error("That OpenAPI spec has no operations.");
  return {
    tools: result.tools as OpenApiTool[],
    baseUrl: result.baseUrl,
    title: result.title || config.name || "OpenAPI",
  };
}
