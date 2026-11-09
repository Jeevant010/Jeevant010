import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, mkdir, writeFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 120;

const run = promisify(execFile);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function esc(value: string): string {
  return value.replace(/'/g, "'\\''");
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const files = form.getAll("images").filter((entry): entry is File => entry instanceof File);
  if (!files.length) return NextResponse.json({ error: "Add at least one image." }, { status: 400 });
  if (files.length > 10) return NextResponse.json({ error: "Maximum 10 images." }, { status: 400 });

  const seconds = Math.min(Math.max(Number(form.get("seconds") || 2), 1), 6);

  const work = await mkdtemp(path.join(tmpdir(), "jeevant-video-"));
  const outName = `jeevant-${Date.now()}-${crypto.randomBytes(3).toString("hex")}.mp4`;
  const outDir = path.join(process.cwd(), "public", "media");

  try {
    const lines: string[] = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json({ error: `${file.name} is larger than 15 MB.` }, { status: 400 });
      }
      const ext = EXT[file.type] || "jpg";
      const filePath = path.join(work, `img${index}.${ext}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      lines.push(`file '${esc(filePath)}'`, `duration ${seconds}`);
    }

    // The concat demuxer needs the last entry repeated without a duration.
    const last = lines[lines.length - 2];
    lines.push(last);

    const listPath = path.join(work, "list.txt");
    await writeFile(listPath, lines.join("\n"), "utf8");

    await mkdir(outDir, { recursive: true });
    const outPath = path.join(outDir, outName);

    await run(
      "ffmpeg",
      [
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", listPath,
        "-vf",
        "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-movflags", "+faststart",
        outPath,
      ],
      { timeout: 110_000, maxBuffer: 4 * 1024 * 1024 }
    );

    return NextResponse.json({ ok: true, url: `/media/${outName}`, images: files.length, seconds });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Video creation failed: ${String(error?.stderr || error?.message || error).slice(0, 300)}` },
      { status: 500 }
    );
  } finally {
    await rm(work, { recursive: true, force: true }).catch(() => {});
  }
}
