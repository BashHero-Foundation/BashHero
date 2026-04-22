import os
from pathlib import Path
import re

out_dir = Path.cwd() / "out"

path_regex = re.compile(r'(href|src|content)="\/([^"]*)"')

for html_file_path in list(out_dir.rglob("*.html")):
    print("reapathing: ", html_file_path)
    html_dir = html_file_path.parent

    relative_path = os.path.relpath(out_dir, html_dir)

    html_content = html_file_path.read_text(encoding="utf-8")

    def replace_path(match: re.Match):
        attribute = match.group(1)
        abs_path = match.group(2)
        
        if abs_path.startswith('/'):
            return match.group(0)
        if abs_path.endswith('/'):
            return f'{attribute}="{relative_path}/{abs_path}index.html"'
        
        return f'{attribute}="{relative_path}/{abs_path}"'


    html_content = path_regex.sub(replace_path, html_content)
    
    html_file_path.write_text(html_content, encoding='utf-8')