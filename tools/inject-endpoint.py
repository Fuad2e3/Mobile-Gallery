#!/usr/bin/env python3
"""Write the order endpoint into index.html at publish time.

The URL lives in the SHEET_ENDPOINT repository secret rather than in the
repository, so the committed page always carries data-sheet="" and the order
form falls back to the visitor's mail client — which is also what happens if
the secret is missing or malformed. Only the published copy on GitHub Pages
carries the endpoint.
"""
import os
import pathlib
import re
import sys

MARKER = 'data-sheet=""'
PREFIX = "https://script.google.com/macros/s/"

url = os.environ.get("SHEET_ENDPOINT", "").strip()

if not url:
    print("inject-endpoint: SHEET_ENDPOINT is empty; skipping URL injection.")
    sys.exit(0)

if not url.startswith(PREFIX) or not url.endswith("/exec") or '"' in url:
    sys.exit("inject-endpoint: SHEET_ENDPOINT is not a valid Apps Script /exec URL.")

page = pathlib.Path("index.html")
if page.exists():
    html = page.read_text(encoding="utf-8")
    if MARKER in html:
        page.write_text(html.replace(MARKER, 'data-sheet="%s"' % url, 1), encoding="utf-8")
        print("inject-endpoint: endpoint written into index.html")

for target_path in ["tools/sheet-endpoint.js", "src/js/sheet-endpoint.js"]:
    js_file = pathlib.Path(target_path)
    if js_file.exists():
        js_content = js_file.read_text(encoding="utf-8")
        new_js = re.sub(r"static url = '[^']*';", "static url = '%s';" % url, js_content, count=1)
        if new_js != js_content:
            js_file.write_text(new_js, encoding="utf-8")
            print("inject-endpoint: endpoint written into %s" % target_path)


