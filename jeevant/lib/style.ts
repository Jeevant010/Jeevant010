// The learned writing style, injected into drafting and agent prompts.

import connectDB from "@/lib/db";
import { StyleProfile } from "@/lib/database/models";

export async function getStyleGuide(): Promise<string> {
  try {
    await connectDB();
    const doc: any = await StyleProfile.findOne({}).sort({ updatedAt: -1 });
    return String(doc?.guide || "").trim();
  } catch {
    return "";
  }
}

export async function getStyleSamples(): Promise<string[]> {
  try {
    await connectDB();
    const doc: any = await StyleProfile.findOne({}).sort({ updatedAt: -1 });
    return (doc?.samples || []).map(String);
  } catch {
    return [];
  }
}
