import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { runAgent } from "@/lib/agent/run";
import { rateLimitDistributed, rateLimitKey } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const limited = await rateLimitDistributed(rateLimitKey("agent-stream", request), 30, 60_000);
  if (!limited.ok) {
    return new Response(JSON.stringify({ error: "Too many requests." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(limited.retryAfterSeconds),
      },
    });
  }

  const body = await request.json().catch(() => null);
  const prompt = String(body?.prompt || "").trim();
  if (!prompt) {
    return new Response(JSON.stringify({ error: "prompt is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      try {
        send("status", { step: "connected" });
        const result = await runAgent(prompt, {
          onStep: (step) => send("status", { step }),
        });
        send("result", result);
      } catch (error) {
        send("error", { message: (error as Error).message || "The agent failed." });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
