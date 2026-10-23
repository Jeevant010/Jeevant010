"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { ChannelAccount } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { ACCOUNT_CHANNEL_IDS } from "@/lib/integrations/account-catalog";

const CHANNELS = ACCOUNT_CHANNEL_IDS;

export async function getAccounts() {
  try {
    await connectDB();
    const docs = await ChannelAccount.find({}).sort({ channel: 1, createdAt: 1 });
    return docs.map((doc: any) => ({
      _id: String(doc._id),
      channel: doc.channel,
      label: doc.label,
      config: doc.config || {},
      isDefault: !!doc.isDefault,
      hasSecrets: !!(doc.secrets && Object.keys(doc.secrets).length),
      secretKeys: Object.keys(doc.secrets || {}),
    }));
  } catch {
    return [];
  }
}

export async function createAccountAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  let channel = String(formData.get("channel") || "whatsapp");
  let label = String(formData.get("label") || "").trim();

  const config: Record<string, string> = {};
  const secrets: Record<string, string> = {};

  const raw = String(formData.get("configJson") || "").trim();
  if (raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

    const data = parsed as Record<string, unknown>;
    if (typeof data.channel === "string" && CHANNELS.includes(data.channel)) channel = data.channel;
    if (typeof data.label === "string" && data.label.trim()) label = data.label.trim();

    const configBlock =
      data.config && typeof data.config === "object" && !Array.isArray(data.config)
        ? (data.config as Record<string, unknown>)
        : null;
    const secretBlock =
      data.secrets && typeof data.secrets === "object" && !Array.isArray(data.secrets)
        ? (data.secrets as Record<string, unknown>)
        : null;

    if (configBlock || secretBlock) {
      for (const [key, value] of Object.entries(configBlock || {})) {
        if (typeof value === "string") config[key.trim()] = value.trim().slice(0, 2000);
      }
      for (const [key, value] of Object.entries(secretBlock || {})) {
        if (typeof value === "string") secrets[key.trim()] = value.trim().slice(0, 4000);
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        if (key === "channel" || key === "label" || typeof value !== "string") continue;
        const secret = /token|secret|key|webhook|password|sid/i.test(key);
        (secret ? secrets : config)[key.trim()] = value.trim().slice(0, 4000);
      }
    }
  }

  if (!CHANNELS.includes(channel) || !label) return;

  const take = (key: string, secret = false) => {
    const value = String(formData.get(key) || "").trim();
    if (value) (secret ? secrets : config)[key] = value;
  };

  take("phoneNumberId");
  take("token", true);
  take("fromNumber");
  take("accountSid", true);
  take("authToken", true);
  take("chatId");
  take("sender");

  await connectDB();
  const existing = await ChannelAccount.countDocuments({ channel });
  await ChannelAccount.create({ channel, label, config, secrets, isDefault: existing === 0 });

  revalidatePath("/accounts");
  revalidatePath("/messages");
}

export async function setDefaultAccountAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  await connectDB();
  const account = await ChannelAccount.findById(id);
  if (!account) return;

  await ChannelAccount.updateMany({ channel: account.channel }, { $set: { isDefault: false } });
  await ChannelAccount.updateOne({ _id: account._id }, { $set: { isDefault: true, updatedAt: new Date() } });
  revalidatePath("/accounts");
  revalidatePath("/messages");
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  await connectDB();
  await ChannelAccount.findByIdAndDelete(id);
  revalidatePath("/accounts");
  revalidatePath("/messages");
}
