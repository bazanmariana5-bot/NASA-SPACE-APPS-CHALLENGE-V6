#!/usr/bin/env python3
"""Genera dist/control_salud_orbital_bundle.html (un solo archivo) a partir de index.html.

Uso:  python3 tools/build.py
No edites el bundle a mano: se regenera desde css/ y js/. El orden de los
archivos sale de las etiquetas <link>/<script> de index.html, así que
index.html es la única fuente de verdad del orden de carga.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "dist" / "control_salud_orbital_bundle.html"

html = (ROOT / "index.html").read_text(encoding="utf-8")


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


# --- CSS: todas las hojas locales -> un único <style> en el lugar de la primera
css_tags = re.findall(r'[ \t]*<link rel="stylesheet" href="(css/[^"]+)">\n?', html)
css = "\n\n".join(read(p).replace("</style", "<\\/style") for p in css_tags)
style_block = f"<style>\n{css}\n  </style>\n"
first = True


def css_sub(m):
    global first
    if first:
        first = False
        return "  " + style_block
    return ""


html = re.sub(r'[ \t]*<link rel="stylesheet" href="css/[^"]+">\n?', css_sub, html)


# --- JS: cada <script src> local -> <script> en línea, mismo orden y mismo ámbito global
def js_sub(m):
    code = read(m.group(1)).replace("</script", "<\\/script")
    return f"<script>\n{code}\n  </script>"


html = re.sub(r'<script src="(js/[^"]+)"></script>', js_sub, html)

OUT.parent.mkdir(exist_ok=True)
OUT.write_text(html, encoding="utf-8")
print(f"OK -> {OUT.relative_to(ROOT)}  ({OUT.stat().st_size / 1024:.0f} KB)")
