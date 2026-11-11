import { NextRequest } from "next/server";
import { discoverTools, highestRisk } from "@/lib/connectors/discover";
import {
  connectorConfig,
  getConnectorById,
  publicConnector,
  refreshConnectorRegistry,
} from "@/lib/connectors/store";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const { id } = await context.params;
  const doc = await getConnectorById(id);
  if (!doc) return mobileJson(request, { error: "Connector not found." }, { status: 404 });

  try {
    const discovered = await discoverTools(connectorConfig(doc));
    doc.tools = discovered.tools;
    doc.baseUrl = discovered.baseUrl;
    doc.risk = highestRisk(discovered.tools);
    doc.lastSyncedAt = new Date();
    doc.lastError = "";
    doc.updatedAt = new Date();
    await doc.save();
    await refreshConnectorRegistry(true);
    return mobileJson(request, { connector: publicConnector(doc) });
  } catch (error) {
    doc.lastError = (error as Error).message.slice(0, 500);
    doc.updatedAt = new Date();
    await doc.save();
    await refreshConnectorRegistry(true);
    return mobileJson(
      request,
      { error: "Sync failed.", detail: (error as Error).message },
      { status: 400 }
    );
  }
}
