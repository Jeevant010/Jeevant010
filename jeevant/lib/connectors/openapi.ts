// OpenAPI 3 (and basic Swagger 2) loader. A spec becomes a set of tool entries
// with a method, path, query parameters, and a body mode. No code generation is
// involved: the generic HTTP executor uses this metadata at call time.

import { assertHttpUrl, connectorFetch } from "./http";
import type { ConnectorAuth, RemoteTool } from "./types";

type Json = Record<string, any>;

export type OpenApiTool = RemoteTool & {
  method: string;
  path: string;
  queryParams: string[];
  bodyMode: "none" | "object" | "value";
};

export type OpenApiResult = {
  tools: OpenApiTool[];
  baseUrl: string;
  title: string;
};

function resolveRef(spec: Json, ref: string): any {
  if (!ref.startsWith("#/")) return null;
  let node: any = spec;
  for (const part of ref.slice(2).split("/")) {
    node = node?.[part.replace(/~1/g, "/").replace(/~0/g, "~")];
    if (node === undefined) return null;
  }
  return node;
}

function resolveNode(spec: Json, node: any, depth = 0): any {
  if (!node || typeof node !== "object" || depth > 10) return node;
  if (typeof node.$ref === "string") {
    return resolveNode(spec, resolveRef(spec, node.$ref), depth + 1);
  }
  if (Array.isArray(node.allOf)) {
    const merged: Json = { ...node };
    delete merged.allOf;
    merged.properties = { ...(merged.properties || {}) };
    merged.required = [...(merged.required || [])];
    for (const part of node.allOf) {
      const resolved = resolveNode(spec, part, depth + 1);
      if (!resolved || typeof resolved !== "object") continue;
      Object.assign(merged.properties, resolved.properties || {});
      if (Array.isArray(resolved.required)) merged.required.push(...resolved.required);
      for (const key of ["type", "description", "items"]) {
        if (merged[key] === undefined && resolved[key] !== undefined) merged[key] = resolved[key];
      }
    }
    return merged;
  }
  return node;
}

function compactSchema(spec: Json, raw: any, depth = 0): Json {
  const schema = resolveNode(spec, raw, depth);
  if (!schema || typeof schema !== "object") return { type: "string" };
  if (Array.isArray(schema.oneOf) && schema.oneOf.length) {
    return compactSchema(spec, schema.oneOf[0], depth + 1);
  }
  if (Array.isArray(schema.anyOf) && schema.anyOf.length) {
    return compactSchema(spec, schema.anyOf[0], depth + 1);
  }

  const output: Json = {};
  for (const key of ["type", "description", "enum", "default", "format", "minimum", "maximum", "pattern"]) {
    if (schema[key] !== undefined) output[key] = schema[key];
  }
  if (schema.type === "array" && schema.items) {
    output.type = "array";
    output.items = compactSchema(spec, schema.items, depth + 1);
  }
  if (schema.type === "object" && schema.properties && depth < 3) {
    output.type = "object";
    output.properties = {};
    for (const [key, value] of Object.entries(schema.properties as Json)) {
      output.properties[key] = compactSchema(spec, value, depth + 1);
    }
    if (Array.isArray(schema.required)) output.required = schema.required;
  }
  if (!output.type && schema.properties) output.type = "object";
  if (!output.type) output.type = "string";
  return output;
}

function operationName(method: string, path: string, operation: Json): string {
  const raw =
    String(operation.operationId || "").trim() ||
    `${method}_${path.replace(/[{}]/g, "").replace(/\//g, "_")}`;
  const cleaned = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return cleaned || `${method}_endpoint`;
}

function riskFor(method: string, operation: Json): RemoteTool["risk"] {
  if (operation["x-read-only"] === true || operation["x-readonly"] === true) return "read";
  if (method === "get" || method === "head" || method === "options") return "read";
  if (method === "delete") return "destructive";
  return "external";
}

function serverBase(spec: Json, specUrl: string): string {
  let server = "";
  if (Array.isArray(spec.servers) && spec.servers.length) {
    server = String(spec.servers[0]?.url || "");
    const variables = spec.servers[0]?.variables;
    if (variables && typeof variables === "object") {
      for (const [name, value] of Object.entries(variables as Json)) {
        const fallback = value?.default ?? "";
        server = server.replace(new RegExp(`\\{${name}\\}`, "g"), String(fallback));
      }
    }
  } else if (spec.swagger && spec.host) {
    const scheme = Array.isArray(spec.schemes) && spec.schemes.length ? spec.schemes[0] : "https";
    server = `${scheme}://${spec.host}${spec.basePath || ""}`;
  }

  if (!server) return new URL(specUrl).origin;
  try {
    return new URL(server, specUrl).toString().replace(/\/+$/g, "");
  } catch {
    return new URL(specUrl).origin;
  }
}

export function toolsFromOpenApi(spec: Json, specUrl: string): OpenApiResult {
  if (!spec || typeof spec !== "object" || (!spec.openapi && !spec.swagger)) {
    throw new Error("That document is not an OpenAPI or Swagger spec.");
  }
  const baseUrl = serverBase(spec, specUrl);
  const tools: OpenApiTool[] = [];
  const methods = ["get", "post", "put", "patch", "delete", "head", "options"] as const;
  const usedNames = new Set<string>();

  for (const [path, rawPathItem] of Object.entries((spec.paths || {}) as Json)) {
    const pathItem = resolveNode(spec, rawPathItem);
    if (!pathItem || typeof pathItem !== "object") continue;
    const sharedParams = Array.isArray(pathItem.parameters) ? pathItem.parameters : [];

    for (const method of methods) {
      const operation = pathItem[method];
      if (!operation || typeof operation !== "object") continue;

      let name = operationName(method, path, operation);
      if (usedNames.has(name)) {
        let suffix = 2;
        while (usedNames.has(`${name}_${suffix}`)) suffix += 1;
        name = `${name}_${suffix}`;
      }
      usedNames.add(name);

      const rawParams = [...sharedParams, ...(Array.isArray(operation.parameters) ? operation.parameters : [])];
      const params = rawParams
        .map((param: any) => resolveNode(spec, param))
        .filter((param: any) => param && typeof param === "object");

      const properties: Json = {};
      const required: string[] = [];
      const queryParams: string[] = [];
      const pathParams = new Set<string>();

      for (const param of params) {
        const where = String(param.in || "");
        if (where !== "path" && where !== "query") continue;
        const paramName = String(param.name || "").trim();
        if (!paramName) continue;
        const schema = param.schema
          ? compactSchema(spec, param.schema)
          : compactSchema(spec, param);
        properties[paramName] = {
          ...schema,
          ...(param.description ? { description: String(param.description) } : {}),
        };
        if (param.required === true || where === "path") required.push(paramName);
        if (where === "query") queryParams.push(paramName);
        if (where === "path") pathParams.add(paramName);
      }

      let bodyMode: OpenApiTool["bodyMode"] = "none";
      const requestBody = resolveNode(spec, operation.requestBody);
      const bodySchema =
        requestBody?.content?.["application/json"]?.schema ||
        requestBody?.content?.["application/*+json"]?.schema;
      const legacyBody = params.find((param: any) => param.in === "body");
      const effectiveBody = bodySchema || legacyBody?.schema;
      if (effectiveBody) {
        const resolved = resolveNode(spec, effectiveBody);
        const bodyProperties = resolved?.properties;
        if (bodyProperties && typeof bodyProperties === "object" && !Array.isArray(bodyProperties)) {
          bodyMode = "object";
          for (const [key, value] of Object.entries(bodyProperties as Json)) {
            properties[key] = compactSchema(spec, value);
          }
          if (Array.isArray(resolved.required)) required.push(...resolved.required);
        } else {
          bodyMode = "value";
          properties.body = compactSchema(spec, effectiveBody);
          if (requestBody?.required === true) required.push("body");
        }
      }

      const inputSchema: Json = { type: "object", properties };
      if (required.length) inputSchema.required = Array.from(new Set(required));

      const summary = String(operation.summary || "").trim();
      const detail = String(operation.description || "").trim();
      const label = summary || detail || name;
      const description = `${method.toUpperCase()} ${path} — ${label}${
        operation.deprecated ? " (deprecated)" : ""
      }`.slice(0, 600);

      tools.push({
        name,
        description,
        inputSchema,
        risk: riskFor(method, operation),
        method: method.toUpperCase(),
        path,
        queryParams,
        bodyMode,
      });

      if (tools.length >= 500) return { tools, baseUrl, title: String(spec.info?.title || "") };
    }
  }

  return {
    tools,
    baseUrl,
    title: String(spec.info?.title || ""),
  };
}

export async function loadOpenApi(
  config: { url: string; auth?: ConnectorAuth }
): Promise<OpenApiResult> {
  const url = assertHttpUrl(config.url);
  const res = await connectorFetch(
    url.toString(),
    { method: "GET", headers: { Accept: "application/json, application/vnd.oai.openapi+json" } },
    config.auth,
    25_000
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAPI spec returned ${res.status}: ${text.slice(0, 240)}`);
  let spec: Json;
  try {
    spec = JSON.parse(text);
  } catch {
    throw new Error("That OpenAPI spec is not JSON. Paste a JSON spec URL for now (YAML comes later).");
  }
  return toolsFromOpenApi(spec, url.toString());
}

export function buildOpenApiRequest(
  tool: Pick<OpenApiTool, "method" | "path" | "queryParams" | "bodyMode">,
  baseUrl: string,
  args: Record<string, unknown>
): { method: string; url: string; body?: unknown } {
  const method = String(tool.method || "GET").toUpperCase();
  const pathParams = new Set<string>();
  const path = String(tool.path || "/").replace(/\{([^}]+)\}/g, (_match, rawName: string) => {
    const name = rawName.trim();
    pathParams.add(name);
    const value = args[name];
    if (value === undefined || value === null || String(value).trim() === "") {
      throw new Error(`Missing path parameter "${name}".`);
    }
    return encodeURIComponent(String(value));
  });

  const query = new URLSearchParams();
  const used = new Set<string>(pathParams);
  for (const name of tool.queryParams || []) {
    const value = args[name];
    if (value === undefined || value === null || String(value).trim() === "") continue;
    query.set(name, String(value));
    used.add(name);
  }

  let body: unknown;
  if (tool.bodyMode === "object") {
    const payload: Json = {};
    for (const [key, value] of Object.entries(args)) {
      if (used.has(key) || key === "body") continue;
      if (value === undefined) continue;
      payload[key] = value;
    }
    body = payload;
  } else if (tool.bodyMode === "value") {
    body = args.body;
  }

  let url = `${String(baseUrl || "").replace(/\/+$/g, "")}${
    path.startsWith("/") ? path : `/${path}`
  }`;
  const queryString = query.toString();
  if (queryString) url += `${url.includes("?") ? "&" : "?"}${queryString}`;

  return { method, url, body };
}
