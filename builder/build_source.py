#!/usr/bin/env python3
import base64, hashlib, json, os
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
OUT  = HERE / "source.bundle.js"

EXCLUDED_DIRS = {"node_modules", ".next", ".git", "dist", "out", "build",
                 ".turbo", ".cache", "builder", ".vercel", ".idea", ".vscode"}
EXCLUDED_FILES = {".DS_Store", "Thumbs.db", ".env.local"}
TEXT_EXTS = {".json", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".html",
             ".css", ".scss", ".md", ".txt", ".xml", ".ps1", ".yml", ".yaml",
             ".cfg", ".ini", ".conf"}
SPECIAL_TEXT = {"Dockerfile", "LICENSE", "LICENCE", ".gitignore", ".dockerignore"}
MAX_SIZE = 2 * 1024 * 1024

files, h = {}, hashlib.sha256()

for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
    for name in filenames:
        abs_path = Path(dirpath) / name
        rel = abs_path.relative_to(ROOT).as_posix()
        if rel.split("/")[0] == "builder" or name in EXCLUDED_FILES:
            continue
        if abs_path.stat().st_size > MAX_SIZE:
            print(f"Skipping {rel} (too large)")
            continue

        data = abs_path.read_bytes()
        h.update(rel.encode()); h.update(data)

        is_text = abs_path.suffix in TEXT_EXTS or name in SPECIAL_TEXT
        files[rel] = (
            {"type": "text",   "content": data.decode("utf-8")}
            if is_text else
            {"type": "binary", "content": base64.b64encode(data).decode("ascii")}
        )

version = h.hexdigest()[:12]
OUT.write_text(
    "// Auto-generated — do not edit.\n"
    f"window.__SOURCE_VERSION__ = {json.dumps(version)};\n"
    f"window.__SOURCE__ = {json.dumps(files, separators=(',', ':'))};\n",
    encoding="utf-8",
)
print(f"Wrote {OUT} ({len(files)} file(s), v{version})")