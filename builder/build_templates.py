#!/usr/bin/env python3
import hashlib, json
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATES = HERE / "templates"
OUT = HERE / "templates.bundle.js"

templates = {}
for tmpl_dir in sorted(TEMPLATES.iterdir()):
    if not tmpl_dir.is_dir():
        continue
    files = {}
    for f in sorted(tmpl_dir.iterdir()):
        if f.suffix == ".json":
            files[f.name] = json.loads(f.read_text(encoding="utf-8"))
    templates[tmpl_dir.name] = files

version = hashlib.sha256(
    json.dumps(templates, sort_keys=True).encode()
).hexdigest()[:12]

OUT.write_text(
    "// Auto-generated — do not edit.\n"
    f"window.__TEMPLATES_VERSION__ = {json.dumps(version)};\n"
    f"window.__TEMPLATES__ = {json.dumps(templates, separators=(',', ':'))};\n",
    encoding="utf-8",
)
print(f"Wrote {OUT} ({len(templates)} template(s), v{version})")