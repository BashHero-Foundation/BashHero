import os
from pathlib import Path
import re

out_dir = Path.cwd() / "out"

path_regex = re.compile(r'(<a .*href=")\/([^"]*)"')

for html_file_path in list(out_dir.rglob("*.html")):
    print("reapathing: ", html_file_path)
    html_dir = html_file_path.parent

    html_content = html_file_path.read_text(encoding="utf-8")

    def replace_path(match: re.Match):
        path = match.group(2)
        return f'{match.group(1)}./{re.sub("/", "-", path)}.html"'

    html_content = path_regex.sub(replace_path, html_content)
    
    html_file_path.write_text(html_content, encoding='utf-8')

    if html_dir != out_dir:
        print(f"moving: {html_file_path}")

        relative_path = os.path.relpath(html_dir, out_dir)

        os.rename(html_file_path, f"{out_dir}/{re.sub("/", "-", relative_path)}.html")