import { readFile, writeFile } from "node:fs/promises";

const manifest = JSON.parse(
  await readFile("public/levels_manifest.json", "utf8")
);

const imports = manifest
  .map((p, i) => `import chapter${i + 1} from "../public${p.replace(/^\/?/, "/")}";`)
  .join("\n");

const names = manifest.map((_, i) => `chapter${i + 1}`);

await writeFile(
  "app/levelsUtils.ts",
  `${imports}

export const chapters = [${names.join(", ")}];
export const allLevels = chapters.flatMap((c) => c.levels);
`
);