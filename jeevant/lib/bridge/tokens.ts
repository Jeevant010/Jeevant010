import { createHash, randomBytes } from "node:crypto";
import connectDB from "@/lib/db";
import { ActionToken } from "@/lib/database/models";
import { audit } from "@/lib/guardrails/policy";
import { runBridgeAction } from "./actions";
import { getActionMeta, validateActionArgs } from "./catalog";

type TokenDoc = {
  _id: unknown;
  action: string;
  args?: unknown;
  label?: string;
  hint?: string;
  status?: string;
  uses?: number;
  maxUses?: number;
  expiresAt: Date | string;
  createdAt?: Date | string;
  lastUsedAt?: Date | string | null;
  result?: string;
};

export type TokenView = {
  id: string;
  action: string;
  label: string;
  hint: string;
  status: "active" | "exhausted" | "revoked" | "expired";
  uses: number;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
  lastUsedAt: string | null;
  result: string;
};

export type CreateOutcome =
  | { ok: true; raw: string; path: string; token: TokenView }
  | { ok: false; error: string };

export type PreviewOutcome =
  | { ok: true; action: string; label: string; token: TokenView }
  | { ok: false; status: number; error: string };

export type RunOutcome = {
  ok: boolean;
  status: number;
  error?: string;
  summary?: string;
  action?: string;
  data?: unknown;
  receipt?: { tokenId: string; uses: number; maxUses: number; at: string };
};

const MAX_TTL_MINUTES = 43_200;
const DEFAULT_TTL_MINUTES = 15;
const DEFAULT_REUSABLE_TTL_MINUTES = 43_200;

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function toISO(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function serialize(doc: TokenDoc): TokenView {
  const status = doc.status === "revoked" || doc.status === "exhausted"
    ? doc.status
    : new Date(doc.expiresAt).getTime() <= Date.now()
      ? "expired"
      : "active";

  return {
    id: String(doc._id),
    action: doc.action,
    label: String(doc.label || ""),
    hint: String(doc.hint || ""),
    status,
    uses: Number(doc.uses || 0),
    maxUses: Number(doc.maxUses ?? 1),
    expiresAt: toISO(doc.expiresAt) || "",
    createdAt: toISO(doc.createdAt) || "",
    lastUsedAt: toISO(doc.lastUsedAt),
    result: String(doc.result || ""),
  };
}

export async function createActionToken(input: {
  action: string;
  args?: Record<string, unknown>;
  label?: string;
  ttlMinutes?: number;
  maxUses?: number;
}): Promise<CreateOutcome> {
  const meta = getActionMeta(input.action);
  if (!meta) return { ok: false, error: `Unknown action "${input.action}".` };

  const validation = validateActionArgs(meta, input.args || {});
  if (!validation.ok) return { ok: false, error: validation.error };

  const maxUses = Math.min(Math.max(Math.round(input.maxUses ?? 1), 0), 1000);
  const fallbackTtl = maxUses === 0 ? DEFAULT_REUSABLE_TTL_MINUTES : DEFAULT_TTL_MINUTES;
  const ttlMinutes = Math.min(Math.max(Math.round(input.ttlMinutes ?? fallbackTtl), 1), MAX_TTL_MINUTES);

  const raw = `jv_${randomBytes(24).toString("base64url")}`;
  await connectDB();
  const doc = await ActionToken.create({
    tokenHash: hashToken(raw),
    hint: raw.slice(0, 12),
    action: meta.id,
    args: validation.args,
    label: String(input.label || "").slice(0, 80),
    status: "active",
    maxUses,
    uses: 0,
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
  });

  return {
    ok: true,
    raw,
    path: `/api/actions/run/${raw}`,
    token: serialize(doc as unknown as TokenDoc),
  };
}

export async function listActionTokens(): Promise<TokenView[]> {
  await connectDB();
  const docs = await ActionToken.find({}).sort({ createdAt: -1 }).limit(50).lean();
  return (docs as unknown as TokenDoc[]).map(serialize);
}

export async function revokeActionToken(id: string): Promise<boolean> {
  await connectDB();
  const doc = await ActionToken.findByIdAndUpdate(id, { $set: { status: "revoked" } }, { new: true });
  return !!doc;
}

export async function previewActionToken(raw: string): Promise<PreviewOutcome> {
  await connectDB();
  const doc = await ActionToken.findOne({ tokenHash: hashToken(raw) }).lean();
  if (!doc) return { ok: false, status: 404, error: "Unknown or deleted link." };

  const token = serialize(doc as unknown as TokenDoc);
  return {
    ok: true,
    action: token.action,
    label: token.label,
    token,
  };
}

export async function runActionToken(
  raw: string,
  bodyArgs: Record<string, unknown> = {}
): Promise<RunOutcome> {
  await connectDB();
  const tokenHash = hashToken(raw);
  const now = new Date();

  const doc = await ActionToken.findOneAndUpdate(
    {
      tokenHash,
      status: "active",
      expiresAt: { $gt: now },
      $expr: { $or: [{ $eq: ["$maxUses", 0] }, { $lt: ["$uses", "$maxUses"] }] },
    },
    { $inc: { uses: 1 }, $set: { lastUsedAt: now } },
    { new: true }
  );

  if (!doc) {
    const existing = await ActionToken.findOne({ tokenHash }).lean();
    const current = existing as unknown as TokenDoc | null;
    const reason = !current
      ? "Unknown or deleted link."
      : current.status === "revoked"
        ? "This link was revoked."
        : current.status === "exhausted" || (Number(current.maxUses) > 0 && Number(current.uses) >= Number(current.maxUses))
          ? "This link has already been used."
          : "This link has expired.";
    return { ok: false, status: 410, error: reason };
  }

  const token = doc as unknown as TokenDoc;
  const meta = getActionMeta(token.action);
  if (!meta) {
    await ActionToken.findByIdAndUpdate(token._id, { $set: { status: "exhausted", result: "Unknown action." } });
    return { ok: false, status: 400, error: `Unknown action "${token.action}".` };
  }

  const merged = { ...(token.args as Record<string, unknown> | undefined), ...bodyArgs };
  const validation = validateActionArgs(meta, merged);
  if (!validation.ok) {
    await ActionToken.findByIdAndUpdate(token._id, { $set: { result: validation.error } });
    return { ok: false, status: 400, error: validation.error, action: token.action };
  }

  const exhausted = Number(token.maxUses) > 0 && Number(token.uses) >= Number(token.maxUses);
  if (exhausted) {
    await ActionToken.findByIdAndUpdate(token._id, { $set: { status: "exhausted" } });
  }

  let ok = false;
  let summary = "";
  let data: unknown;

  try {
    const result = await runBridgeAction(token.action, validation.args);
    ok = result.ok;
    summary = result.summary;
    data = result.data;
  } catch (error) {
    summary = `Action failed: ${(error as Error).message}`;
  }

  await ActionToken.findByIdAndUpdate(token._id, { $set: { result: summary.slice(0, 500) } });
  await audit(
    { kind: `bridge:${token.action}`, target: String(token._id), meta: { label: token.label, uses: token.uses } },
    ok ? "executed" : "failed",
    summary
  );

  return {
    ok,
    status: ok ? 200 : 500,
    summary,
    action: token.action,
    data,
    receipt: {
      tokenId: String(token._id),
      uses: Number(token.uses),
      maxUses: Number(token.maxUses),
      at: new Date().toISOString(),
    },
  };
}
