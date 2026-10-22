// Resolve the credentials for a channel: an explicit account id, else the
// channel's default account, else null (adapters then fall back to env vars).

import connectDB from "@/lib/db";
import { ChannelAccount } from "@/lib/database/models";

export interface ResolvedAccount {
  id?: string;
  label?: string;
  config: Record<string, any>;
  secrets: Record<string, any>;
}

export async function resolveAccount(channel: string, accountId?: string): Promise<ResolvedAccount | null> {
  try {
    await connectDB();
    const doc: any = accountId
      ? await ChannelAccount.findById(accountId).lean()
      : (await ChannelAccount.findOne({ channel, isDefault: true }).lean()) ||
        (await ChannelAccount.findOne({ channel }).lean());

    if (!doc) return null;
    return {
      id: String(doc._id),
      label: doc.label,
      config: doc.config || {},
      secrets: doc.secrets || {},
    };
  } catch {
    return null;
  }
}
