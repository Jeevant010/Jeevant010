import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { Connector } from "@/lib/database/models";
import {
  publicConnector,
  refreshConnectorRegistry,
} from "@/lib/connectors/store";
import { mobileJson, mobileOptions, requireMobileAuth, unauthorized } from "@/lib/mobile/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return mobileOptions(request);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return mobileJson(request, { error: "Invalid connector id." }, { status: 400 });

  const body = await request.json().catch(() => null);
  await connectDB();
  const doc = await Connector.findById(id);
  if (!doc) return mobileJson(request, { error: "Connector not found." }, { status: 404 });

  if (typeof body?.enabled === "boolean") doc.enabled = body.enabled;
  doc.updatedAt = new Date();
  await doc.save();
  await refreshConnectorRegistry(true);
  return mobileJson(request, { connector: publicConnector(doc) });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await requireMobileAuth(request))) return unauthorized(request);
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return mobileJson(request, { error: "Invalid connector id." }, { status: 400 });

  await connectDB();
  const doc = await Connector.findByIdAndDelete(id);
  if (!doc) return mobileJson(request, { error: "Connector not found." }, { status: 404 });
  await refreshConnectorRegistry(true);
  return mobileJson(request, { ok: true });
}
