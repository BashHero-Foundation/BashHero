#!/usr/bin/env python3
"""Build bundles, serve builder/, open the browser."""
import argparse
import http.server
import os
import socketserver
import subprocess
import sys
import webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(HERE), **kwargs)
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, fmt, *args):
        pass  # keep the terminal quiet

def run(script: str) -> None:
    print(f"> python {script}")
    result = subprocess.run(
        [sys.executable, str(HERE / script)],
        cwd=HERE,
    )
    if result.returncode != 0:
        raise SystemExit(f"{script} exited with {result.returncode}")

def serve(preferred: int) -> None:
    try:
        httpd = socketserver.TCPServer(("127.0.0.1", preferred), Handler)
    except OSError:
        print(f"Port {preferred} busy — letting the OS choose.")
        httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)

    port = httpd.server_address[1]
    url = f"http://localhost:{port}/"
    print("─" * 46)
    print(f"  BashHero builder is running at:")
    print(f"  {url}")
    print()
    print("  Press Ctrl+C to stop.")
    print("─" * 46 + "\n")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down…")
        httpd.shutdown()

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-build", action="store_true")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    if not args.skip_build:
        print("Building bundles…\n")
        run("build_templates.py")
        run("build_source.py")
        print()
    else:
        print("Skipping build (--skip-build).\n")

    serve(args.port)

if __name__ == "__main__":
    main()