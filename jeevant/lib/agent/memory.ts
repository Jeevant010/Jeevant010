// Memory retrieval for the planner. The prompt gets the most relevant durable
// facts plus a few recent ones, not simply the last 20 rows.

import connectDB from "@/lib/db";
import { ChatMessage, Memory } from "@/lib/database/models";

export type MemoryRow = {
  text: string;
  tags?: string[];
  createdAt?: number;
};

export type ConversationRow = {
  role: string;
  content: string;
  createdAt?: number;
};

const STOP = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "is", "are", "was", "were",
  "i", "me", "my", "you", "your", "it", "this", "that", "what", "when", "where", "how", "do",
  "did", "can", "could", "should", "would", "please", "with", "about", "from", "at", "be",
]);

function tokens(value: string): string[] {
  return Array.from(
    new Set(
      String(value || "")
        .toLowerCase()
        .match(/[a-z0-9_]+/g)
        ?.filter((token) => token.length > 1 && !STOP.has(token)) || []
    )
  );
}

function scoreText(text: string, tags: string[], queryTokens: string[]): number {
  if (!queryTokens.length) return 0;
  const haystack = `${text} ${tags.join(" ")}`.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(haystack)) {
      score += 3;
    } else if (haystack.includes(token)) {
      score += 1;
    }
    if (tags.some((tag) => tag.toLowerCase() === token)) score += 2;
  }
  return score;
}

function recentBoost(index: number, total: number): number {
  if (total <= 1) return 0.5;
  return ((total - index) / total) * 0.5;
}

export function rankMemories(query: string, rows: MemoryRow[], limit = 8): string[] {
  const queryTokens = tokens(query);
  const ordered = [...rows].sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0));
  const ranked = ordered.map((row, index) => ({
    row,
    index,
    score:
      scoreText(row.text, (row.tags || []).map(String), queryTokens) +
      recentBoost(index, ordered.length),
  }));

  if (!queryTokens.length) {
    return ranked.slice(0, limit).map((item) => item.row.text);
  }

  const matched = ranked.filter((item) => item.score > 1).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected: string[] = [];
  const seen = new Set<string>();

  for (const item of matched) {
    if (selected.length >= limit) break;
    if (seen.has(item.row.text)) continue;
    seen.add(item.row.text);
    selected.push(item.row.text);
  }

  // Always keep a little recent context even when nothing matches.
  for (const item of ranked) {
    if (selected.length >= Math.min(limit, matched.length + 3)) break;
    if (seen.has(item.row.text)) continue;
    seen.add(item.row.text);
    selected.push(item.row.text);
  }

  return selected.slice(0, limit);
}

export function rankConversation(query: string, rows: ConversationRow[], limit = 8): ConversationRow[] {
  const queryTokens = tokens(query);
  if (!rows.length) return [];
  const ordered = [...rows].sort((left, right) => (right.createdAt || 0) - (left.createdAt || 0));
  const ranked = ordered.map((row, index) => ({
    row,
    index,
    score: scoreText(row.content, [], queryTokens) + recentBoost(index, ordered.length),
  }));

  if (!queryTokens.length) {
    return [...ordered].reverse().slice(-limit);
  }

  const selected = new Map<number, ConversationRow>();
  for (const item of ranked.filter((entry) => entry.score > 1).sort((a, b) => b.score - a.score)) {
    if (selected.size >= Math.max(1, limit - 3)) break;
    selected.set(item.index, item.row);
  }
  // Keep the last few turns so the exchange has immediate context.
  for (const item of ranked.slice(0, 4)) selected.set(item.index, item.row);

  return Array.from(selected.values())
    .sort((left, right) => (left.createdAt || 0) - (right.createdAt || 0))
    .slice(-limit);
}

export async function retrieveMemories(query: string, limit = 8): Promise<string[]> {
  try {
    await connectDB();
    const docs: any[] = await Memory.find({}).sort({ createdAt: -1 }).limit(300).lean();
    return rankMemories(
      query,
      docs.map((doc) => ({
        text: String(doc.text || ""),
        tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
        createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : 0,
      })),
      limit
    ).filter(Boolean);
  } catch {
    return [];
  }
}

export async function retrieveConversation(query: string, limit = 8): Promise<string> {
  try {
    await connectDB();
    const docs: any[] = await ChatMessage.find({ thread: "main" }).sort({ createdAt: -1 }).limit(60).lean();
    const rows: ConversationRow[] = docs.map((doc) => ({
      role: String(doc.role || "user"),
      content: String(doc.content || ""),
      createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : 0,
    }));
    return rankConversation(query, rows, limit)
      .map((row) => `${row.role}: ${row.content}`)
      .join("\n");
  } catch {
    return "";
  }
}
