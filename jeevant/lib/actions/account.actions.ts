"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { ChannelAccount } from "@/lib/database/models";
import { getSession } from "@/lib/auth";

const CHANNELS = ["whatsapp", "sms", "call", "telegram", "email"];

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
    }));
  } catch {
    return [];
  }
}

export async function createAccountAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const channel = String(formData.get("channel") || "whatsapp");
  const label = String(formData.get("label") || "").trim();
  if (!CHANNELS.includes(channel) || !label) return;

  const config: Record<string, string> = {};
  const secrets: Record<string, string> = {};

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
