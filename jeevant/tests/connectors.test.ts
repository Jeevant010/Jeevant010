import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { buildOpenApiRequest, toolsFromOpenApi } from "../lib/connectors/openapi";
import { callMcpTool, listMcpTools } from "../lib/connectors/mcp";
import {
  clearDynamicTools,
  describeTool,
  registerDynamicTools,
  retrieveTools,
  searchTools,
  type ToolEntry,
} from "../lib/agent/registry";

const spec = {
  openapi: "3.0.0",
  info: { title: "Demo API", version: "1.0.0" },
  servers: [{ url: "https://api.example.com/v1" }],
  components: {
    schemas: {
      IssueUpdate: {
        type: "object",
        properties: { title: { type: "string" }, done: { type: "boolean" } },
        required: ["title"],
      },
    },
  },
  paths: {
    "/issues": {
      get: {
        operationId: "listIssues",
        summary: "List issues",
        parameters: [
          { name: "state", in: "query", schema: { type: "string", enum: ["open", "closed"] } },
          { name: "limit", in: "query", schema: { type: "integer" } },
        ],
      },
    },
    "/issues/{id}": {
      post: {
        operationId: "updateIssue",
        summary: "Update an issue",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/IssueUpdate" } } },
        },
      },
      delete: {
        operationId: "deleteIssue",
        summary: "Delete an issue",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      },
    },
    "/search": {
      post: {
        operationId: "searchIssues",
        summary: "Read-only search",
        "x-read-only": true,
        requestBody: {
          content: { "application/json": { schema: { type: "object", properties: { q: { type: "string" } } } } },
        },
      },
    },
  },
};

test("OpenAPI tools preserve methods, schemas, and risk", () => {
  const result = toolsFromOpenApi(spec, "https://api.example.com/openapi.json");
  assert.equal(result.baseUrl, "https://api.example.com/v1");
  assert.equal(result.tools.length, 4);

  const list = result.tools.find((tool) => tool.name === "list_issues");
  assert.ok(list);
  assert.equal(list?.risk, "read");
  assert.equal(list?.method, "GET");
  assert.deepEqual(list?.queryParams, ["state", "limit"]);

  const update = result.tools.find((tool) => tool.name === "update_issue");
  assert.ok(update);
  assert.equal(update?.risk, "external");
  assert.equal(update?.bodyMode, "object");
  assert.ok((update?.inputSchema.required as string[]).includes("id"));
  assert.ok((update?.inputSchema.required as string[]).includes("title"));

  const remove = result.tools.find((tool) => tool.name === "delete_issue");
  assert.equal(remove?.risk, "destructive");

  const search = result.tools.find((tool) => tool.name === "search_issues");
  assert.equal(search?.risk, "read");
});

test("OpenAPI request builder handles path, query, and body args", () => {
  const result = toolsFromOpenApi(spec, "https://api.example.com/openapi.json");
  const update = result.tools.find((tool) => tool.name === "update_issue");
  assert.ok(update);
  const request = buildOpenApiRequest(update!, result.baseUrl, { id: "42", title: "Fix it", done: true });
  assert.equal(request.method, "POST");
  assert.equal(request.url, "https://api.example.com/v1/issues/42");
  assert.deepEqual(request.body, { title: "Fix it", done: true });

  const list = result.tools.find((tool) => tool.name === "list_issues");
  const read = buildOpenApiRequest(list!, result.baseUrl, { state: "open", limit: 5 });
  assert.equal(read.method, "GET");
  assert.match(read.url, /\/issues\?state=open&limit=5$/);
  assert.equal(read.body, undefined);

  assert.throws(() => buildOpenApiRequest(update!, result.baseUrl, { title: "no id" }), /Missing path parameter/);
});

test("MCP client initializes, lists, and calls a tool over HTTP", async () => {
  let sawAuth = "";
  const server = createServer(async (req, res) => {
    sawAuth = String(req.headers.authorization || "");
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const message = JSON.parse(raw || "{}");

    if (message.method === "initialize") {
      res.writeHead(200, { "content-type": "application/json", "mcp-session-id": "session-1" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "mock", version: "1" },
          },
        })
      );
      return;
    }
    if (message.method === "notifications/initialized") {
      res.writeHead(202);
      res.end();
      return;
    }
    if (message.method === "tools/list") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            tools: [
              {
                name: "echo",
                description: "Echo text back",
                inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
                annotations: { readOnlyHint: true },
              },
            ],
          },
        })
      );
      return;
    }
    if (message.method === "tools/call") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: message.id,
          result: { content: [{ type: "text", text: `echo:${message.params?.arguments?.text || ""}` }] },
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const url = `http://127.0.0.1:${address.port}/mcp`;

  try {
    const tools = await listMcpTools({ url, auth: { type: "bearer", token: "test-token" } });
    assert.equal(tools.length, 1);
    assert.equal(tools[0].name, "echo");
    assert.equal(tools[0].risk, "read");
    assert.equal(sawAuth, "Bearer test-token");

    const result = await callMcpTool({ url, auth: { type: "bearer", token: "test-token" } }, "echo", {
      text: "hello",
    });
    assert.equal(result.ok, true);
    assert.equal(result.result, "echo:hello");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("dynamic tools enter retrieval and can be described", () => {
  const entry: ToolEntry = {
    name: "mockmcp__echo",
    args: '{"type":"object","properties":{"text":{"type":"string"}}}',
    description: "Echo text back through the mock MCP connector",
    tags: ["mockmcp", "echo", "mcp", "text"],
    risk: "read",
    core: false,
    line: 'mockmcp__echo args: {"text":"string"} // Echo text back',
    inputSchema: { type: "object", properties: { text: { type: "string" } } },
    dynamic: {
      connectorId: "000000000000000000000000",
      connectorName: "mockmcp",
      kind: "mcp",
      remoteName: "echo",
    },
  };

  try {
    registerDynamicTools([entry]);
    assert.ok(retrieveTools("use mockmcp echo to say hi").some((tool) => tool.name === "mockmcp__echo"));
    assert.ok(searchTools("mockmcp").some((tool) => tool.name === "mockmcp__echo"));
    assert.equal(describeTool("mockmcp__echo")?.dynamic?.remoteName, "echo");
  } finally {
    clearDynamicTools();
  }
});
