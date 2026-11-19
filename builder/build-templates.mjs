import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(HERE, "templates");
const OUT = resolve(HERE, "templates.bundle.js");

const templates = {};
for (const entry of await readdir(TEMPLATES, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = join(TEMPLATES, entry.name);
  const files = {};
  for (const f of await readdir(dir)) {
    if (!f.endsWith(".json")) continue;
    files[f] = JSON.parse(await readFile(join(dir, f), "utf8"));
  }
  templates[entry.name] = files;
}

const version = createHash("sha256")
  .update(JSON.stringify(templates))
  .digest("hex")
  .slice(0, 12);

await writeFile(
  OUT,
  `// Auto-generated — do not edit.\n` +
  `window.__TEMPLATES_VERSION__ = ${JSON.stringify(version)};\n` +
  `window.__TEMPLATES__ = ${JSON.stringify(templates)};\n`,
  "utf8"
);

console.log(
  `Wrote ${OUT} (${Object.keys(templates).length} template(s), v${version})`
);