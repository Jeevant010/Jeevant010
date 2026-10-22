// Central guardrail policy. Every external action must pass through here.
// There is no auto-send mode: the only choices are "queue for approval" or
// "blocked by emergency stop".

import connectDB from "@/lib/db";
import { Setting, AuditLog } from "@/lib/database/models";

export type GuardrailMode = "approval" | "blocked";

export interface GuardrailSettings {
  mode: GuardrailMode;
  httpAllowlist: string;
}

export interface GuardrailAction {
  kind: string; // post | email | calendar | message | http | ...
  target: string;
  meta?: unknown;
}

export interface GuardrailDecision {
  allowed: boolean;
  mode: GuardrailMode;
  reason: string;
}

export async function getGuardrailSettings(): Promise<GuardrailSettings> {
  try {
    await connectDB();
    const docs = await Setting.find({ key: { $in: ["guardrailMode", "httpAllowlist"] } });
    const map: Record<string, string> = {};
    for (const doc of docs) {
      if (typeof doc.value === "string") map[doc.key] = doc.value;
    }
    return {
      mode: map.guardrailMode === "blocked" ? "blocked" : "approval",
      httpAllowlist: map.httpAllowlist || "",
    };
  } catch {
    // Fail closed: if policy cannot be read, treat as approval (never auto-send).
    return { mode: "approval", httpAllowlist: "" };
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export async function audit(
  action: GuardrailAction,
  decision: "approval" | "blocked" | "executed" | "failed",
  reason: string
): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      action: action.kind,
      target: action.target,
      decision,
      reason,
      meta: action.meta,
    });
  } catch {
    // Audit is best-effort; it must never block the guardrail itself.
  }
}

export async function evaluateExternalAction(action: GuardrailAction): Promise<GuardrailDecision> {
  const settings = await getGuardrailSettings();

  if (settings.mode === "blocked") {
    const reason = "Emergency stop is on — all external actions are blocked.";
    await audit(action, "blocked", reason);
    return { allowed: false, mode: "blocked", reason };
  }

  if (action.kind === "http") {
    const host = hostOf(action.target);
    const allowlist = settings.httpAllowlist
      .split(/[\s,]+/)
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);

    if (!host || !allowlist.includes(host)) {
      const reason = `HTTP host "${host || "unknown"}" is not in the allowlist.`;
      await audit(action, "blocked", reason);
      return { allowed: false, mode: "blocked", reason };
    }
  }

  const reason = "Queued for explicit approval.";
  await audit(action, "approval", reason);
  return { allowed: true, mode: "approval", reason };
}

export function extractHttpHost(url: string): string {
  return hostOf(url);
}
