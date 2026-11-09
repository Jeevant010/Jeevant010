import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(process.cwd(), ".next", "static", "chunks");
const BUDGET_KB = Number(process.env.BUNDLE_BUDGET_KB || 1800);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }

  return files;
}

try {
  const files = (await walk(ROOT)).filter((file) => file.endsWith(".js"));
  let bytes = 0;
  for (const file of files) bytes += (await stat(file)).size;

  const kb = Math.round(bytes / 1024);
  console.log(`bundle budget: ${files.length} chunks, ${kb} KB (limit ${BUDGET_KB} KB)`);

  if (kb > BUDGET_KB) {
    console.error(`Bundle exceeds the budget by ${kb - BUDGET_KB} KB.`);
    process.exit(1);
  }
} catch {
  console.error(`Could not read ${ROOT}. Run npm run build first.`);
  process.exit(1);
}
