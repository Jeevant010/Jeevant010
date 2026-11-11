// Shared connector types. A connector is either an MCP server (JSON-RPC over
// HTTP) or an OpenAPI document. Both produce the same RemoteTool shape so the
// agent registry can treat them identically.

export type ConnectorKind = "mcp" | "openapi";

export type ConnectorRisk = "read" | "write" | "external" | "destructive";

export type ConnectorAuthType = "none" | "bearer" | "header";

export type ConnectorAuth = {
  type: ConnectorAuthType;
  header?: string;
  token?: string;
};

export type RemoteTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  risk: ConnectorRisk;
  method?: string;
  path?: string;
  queryParams?: string[];
  bodyMode?: "none" | "object" | "value";
};

export type ConnectorConfig = {
  name?: string;
  kind: ConnectorKind;
  url: string;
  auth?: ConnectorAuth;
};

export type DiscoveredConnector = {
  tools: RemoteTool[];
  baseUrl: string;
  title: string;
};

export type RemoteCallResult = {
  ok: boolean;
  result: string;
  data?: unknown;
};
