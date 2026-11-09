import webpush from "web-push";
import connectDB from "@/lib/db";
import { PushSubscription } from "@/lib/database/models";

export type PushPayload = { title: string; body: string; url?: string; tag?: string };
export type PushResult = { sent: number; removed: number; failed: number; configured: boolean };

let configured: boolean | null = null;

export function pushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function configure(): boolean {
  if (!pushConfigured()) return false;
  if (configured === null) {
    try {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@localhost",
        process.env.VAPID_PUBLIC_KEY as string,
        process.env.VAPID_PRIVATE_KEY as string
      );
      configured = true;
    } catch {
      configured = false;
    }
  }
  return configured;
}

export function publicKey(): string {
  return process.env.VAPID_PUBLIC_KEY || "";
}

export async function saveSubscription(
  input: { endpoint?: string; keys?: { p256dh?: string; auth?: string } },
  userAgent = ""
): Promise<{ ok: boolean; detail: string }> {
  const endpoint = String(input.endpoint || "");
  const p256dh = String(input.keys?.p256dh || "");
  const auth = String(input.keys?.auth || "");

  if (!endpoint.startsWith("https://")) return { ok: false, detail: "A push endpoint must be HTTPS." };
  if (!p256dh || !auth) return { ok: false, detail: "The subscription is missing its keys." };

  await connectDB();
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { $set: { endpoint, p256dh, auth, userAgent: userAgent.slice(0, 300), lastUsedAt: new Date() } },
    { upsert: true, new: true }
  );

  return { ok: true, detail: "Subscription saved." };
}

export async function removeSubscription(endpoint: string): Promise<boolean> {
  if (!endpoint) return false;
  await connectDB();
  const result = await PushSubscription.deleteOne({ endpoint });
  return result.deletedCount > 0;
}

export async function countSubscriptions(): Promise<number> {
  try {
    await connectDB();
    return await PushSubscription.countDocuments({});
  } catch {
    return 0;
  }
}

export async function sendToAll(payload: PushPayload): Promise<PushResult> {
  if (!configure()) return { sent: 0, removed: 0, failed: 0, configured: false };

  await connectDB();
  const subscriptions = await PushSubscription.find({}).lean();
  let sent = 0;
  let removed = 0;
  let failed = 0;

  await Promise.all(
    (subscriptions as any[]).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
          { TTL: 3600 }
        );
        sent += 1;
        await PushSubscription.updateOne({ _id: subscription._id }, { $set: { lastUsedAt: new Date() } });
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
          removed += 1;
        } else {
          failed += 1;
        }
      }
    })
  );

  return { sent, removed, failed, configured: true };
}
