import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, relative, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, "..");
const OUT = resolve(HERE, "source.bundle.js");

const EXCLUDED_DIRS = new Set([
  "node_modules", ".next", ".git", "dist", "out", "build",
  ".turbo", ".cache", "builder", ".vercel", ".idea", ".vscode"
]);
const EXCLUDED_FILES = new Set([".DS_Store", "Thumbs.db", ".env.local"]);

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const TEXT_EXTS = new Set([
  ".json", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
  ".html", ".css", ".scss", ".md", ".txt", ".xml", ".ps1",
  ".yml", ".yaml", ".cfg", ".ini", ".conf"
]);
const SPECIAL_TEXT_FILES = new Set([
  "Dockerfile", "LICENSE", "LICENCE", ".gitignore", ".dockerignore"
]);

const files = {};
const hash = createHash("sha256");

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      await walk(join(dir, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;
    if (EXCLUDED_FILES.has(entry.name)) continue;

    const abs = join(dir, entry.name);
    const rel = relative(PROJECT_ROOT, abs).replace(/\\/g, "/");
    if (rel === "builder" || rel.startsWith("builder/")) continue;

    const st = await stat(abs);
    if (st.size > MAX_FILE_SIZE) {
      console.warn(`Skipping ${rel} (${st.size} bytes)`);
      continue;
    }

    const ext = entry.name.includes(".")
      ? "." + entry.name.split(".").pop().toLowerCase()
      : "";
    const isText = TEXT_EXTS.has(ext) || SPECIAL_TEXT_FILES.has(entry.name);
    const buf = await readFile(abs);

    hash.update(rel);
    hash.update(buf);

    files[rel] = isText
      ? { type: "text", content: buf.toString("utf8") }
      : { type: "binary", content: buf.toString("base64") };
  }
}

await walk(PROJECT_ROOT);

const version = hash.digest("hex").slice(0, 12);
await writeFile(
  OUT,
  `// Auto-generated — do not edit.\n` +
  `window.__SOURCE_VERSION__ = ${JSON.stringify(version)};\n` +
  `window.__SOURCE__ = ${JSON.stringify(files)};\n`,
  "utf8"
);

console.log(
  `Wrote ${OUT} (${Object.keys(files).length} file(s), v${version})`
);