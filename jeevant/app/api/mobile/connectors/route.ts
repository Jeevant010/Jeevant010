import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Connector } from "@/lib/database/models";
import { sealSecrets } from "@/lib/crypto/secrets";
import { discoverTools, highestRisk } from "@/lib/connectors/discover";
import { assertHttpUrl } from "@/lib/connectors/http";
import {
  normalizeConnectorName,
  publicConnector,
  refreshConnectorRegistry,
} from "@/lib/connectors/store";
import { rateLimitDistributed } from "@/lib/security/rate-limit";
import { clientIp, mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function GET(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  await connectDB();
  const docs = await Connector.find({}).sort({ createdAt: -1 });
  return mobileJson(request, { connectors: docs.map(publicConnector) });
}

export async function POST(request: NextRequest) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);

  const limited = await rateLimitDistributed(`mobile-connectors:${clientIp(request)}`, 10, 10 * 60_000);
  if (!limited.ok) {
    return mobileJson(
      request,
      { error: "Too many connector attempts. Wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const kind = body?.kind === "openapi" ? "openapi" : "mcp";
  const name = normalizeConnectorName(body?.name);
  if (!/^[a-z][a-z0-9_]{1,40}$/.test(name)) {
    return mobileJson(
      request,
      { error: "Name must be 2-40 characters: letters, numbers, and underscores; start with a letter." },
      { status: 400 }
    );
  }

  let url: string;
  try {
    url = assertHttpUrl(String(body?.url || "")).toString();
  } catch (error) {
    return mobileJson(request, { error: (error as Error).message }, { status: 400 });
  }

  const authType =
    body?.authType === "bearer" || body?.authType === "header" ? body.authType : "none";
  const authHeader = String(body?.authHeader || "X-API-Key").trim();
  const token = String(body?.token || "").trim();
  if (authType !== "none" && !token) {
    return mobileJson(request, { error: "A token is required for bearer/header auth." }, { status: 400 });
  }
  if (authType === "header" && !/^[A-Za-z0-9-]+$/.test(authHeader)) {
    return mobileJson(request, { error: "Auth header must be a valid HTTP header name." }, { status: 400 });
  }

  await connectDB();
  const existing = await Connector.findOne({ name });
  if (existing) return mobileJson(request, { error: `Connector "${name}" already exists.` }, { status: 409 });

  try {
    const discovered = await discoverTools({
      name,
      kind,
      url,
      auth: { type: authType, header: authHeader, token },
    });

    const doc = await Connector.create({
      name,
      kind,
      url,
      baseUrl: discovered.baseUrl,
      authType,
      authHeader: authType === "header" ? authHeader : "",
      secrets: authType === "none" ? {} : sealSecrets({ token }),
      enabled: true,
      risk: highestRisk(discovered.tools),
      tools: discovered.tools,
      lastSyncedAt: new Date(),
      lastError: "",
    });

    await refreshConnectorRegistry(true);
    return mobileJson(request, { connector: publicConnector(doc) }, { status: 201 });
  } catch (error) {
    return mobileJson(
      request,
      {
        error: "Could not discover tools from that connector.",
        detail: (error as Error).message,
      },
      { status: 400 }
    );
  }
}
