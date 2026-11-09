"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import { StyleProfile } from "@/lib/database/models";
import { getSession } from "@/lib/auth";
import { getStyleGuide, getStyleSamples } from "@/lib/style";
import { groqChat, groqConfigured } from "@/lib/integrations/groq";

export async function getStyle() {
  return { samples: await getStyleSamples(), guide: await getStyleGuide() };
}

export async function learnStyleAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const raw = String(formData.get("samples") || "");
  const samples = raw
    .split(/\n-{3,}\n/)
    .map((sample) => sample.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (!samples.length) return;

  let guide = "";
  if (groqConfigured()) {
    const content = await groqChat(
      "You analyse a person's writing style and produce a compact, reusable style guide.",
      [
        "Analyse these writing samples. Return plain text, no markdown headings, covering:",
        "tone, typical sentence length, vocabulary, punctuation habits, emoji use, greetings, sign-offs, phrases to reuse, and things to avoid.",
        "Keep it under 180 words and make it directly usable as an instruction for drafting messages in this person's voice.",
        "",
        "SAMPLES:",
        samples.join("\n---\n"),
      ].join("\n"),
      false
    );
    guide = content || "";
  }

  await connectDB();
  const existing: any = await StyleProfile.findOne({}).sort({ updatedAt: -1 });
  if (existing) {
    existing.samples = samples;
    existing.guide = guide;
    existing.updatedAt = new Date();
    await existing.save();
  } else {
    await StyleProfile.create({ samples, guide });
  }

  revalidatePath("/style");
}

export async function saveStyleGuideAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  const guide = String(formData.get("guide") || "").trim();
  await connectDB();
  const existing: any = await StyleProfile.findOne({}).sort({ updatedAt: -1 });
  if (existing) {
    existing.guide = guide;
    existing.updatedAt = new Date();
    await existing.save();
  } else {
    await StyleProfile.create({ samples: [], guide });
  }
  revalidatePath("/style");
}
