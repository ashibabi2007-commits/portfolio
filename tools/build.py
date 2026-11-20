"""
Build the deployable site bundle from src/ parts.

    src/body.html     → page markup (nav … footer, lightbox, toasts)
    static/css/style.css → design system
    static/fonts/fonts.css → self-hosted woff2 @font-face rules
    static/js/app.js  → interactions

Outputs
    static/portfolio.html   Streamlit fragment (body + inlined CSS)
    standalone/index.html   plain static site — drag to Netlify / GitHub Pages

Usage:
    python tools/build.py
"""
from pathlib import Path
import base64
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
BODY = SRC / "body.html"
CSS = ROOT / "static" / "css" / "style.css"
FONTS_CSS = ROOT / "static" / "fonts" / "fonts.css"
JS = ROOT / "static" / "js" / "app.js"
OUT_FRAGMENT = ROOT / "static" / "portfolio.html"
STANDALONE = ROOT / "standalone"

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ashish Dash — Data Analyst in the making</title>
<meta name="description" content="Ashish Dash — B.Tech CSE (AI &amp; ML) student building dashboards, ML models and a portfolio that makes recruiters smile. Data Analytics / AI Trainee.">
<meta name="theme-color" content="#F7F2E8">
<meta property="og:title" content="Ashish Dash — Data Analyst in the making">
<meta property="og:description" content="Dashboards, ML models and one suspiciously fun portfolio. Python · SQL · Power BI · Streamlit.">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="img/favicon.png">
<link rel="stylesheet" href="css/fonts.css">
<link rel="stylesheet" href="css/style.css">
</head>
<body>

"""

TAIL = """
<script src="js/app.js"></script>
</body>
</html>
"""


def main() -> int:
    for f in (BODY, CSS, FONTS_CSS, JS):
        if not f.exists():
            print(f"[build] missing {f}", file=sys.stderr)
            return 1

    body = BODY.read_text(encoding="utf-8").strip()
    if "</script>" in body:
        print("[build] body must not contain inline scripts", file=sys.stderr)
        return 1

    fonts_css = FONTS_CSS.read_text(encoding="utf-8")
    style_css = CSS.read_text(encoding="utf-8")

    # ---------------------------------------------------------------- Streamlit
    # Fully self-contained: CSS, JS, fonts AND images are inlined, and the
    # résumé is embedded as a data URI. Nothing depends on
    # server.enableStaticServing, so the app cannot break if .streamlit/
    # never makes it into the repo (a common Windows-extraction problem).
    static = ROOT / "static"

    def data_uri(path: Path) -> str:
        mime = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
            ".svg": "image/svg+xml", ".woff2": "font/woff2", ".pdf": "application/pdf",
        }.get(path.suffix.lower(), "application/octet-stream")
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        return f"data:{mime};base64,{b64}"

    def inline_ref(m):
        whole, attr, ref = m.group(0), m.group(1), m.group(2)
        target = static / ref
        if not target.exists():
            print(f"[build] WARNING missing asset: {ref}", file=sys.stderr)
            return whole
        return f'{attr}="{data_uri(target)}"'

    # Résumé: DOMPurify strips href="data:" from anchors (it only allows data
    # URIs on img src), so the PDF is hydrated by JS at runtime instead.
    resume = static / "docs" / "Ashish-Dash-Resume.pdf"
    resume_b64 = (
        base64.b64encode(resume.read_bytes()).decode("ascii") if resume.exists() else ""
    )
    body_for_frag = body
    # neutralise the résumé anchors so the generic inliner can't turn them into
    # data: hrefs (DOMPurify strips those); JS hydrates them from RESUME_B64
    body_for_frag = body_for_frag.replace(
        'href="/app/static/docs/Ashish-Dash-Resume.pdf"', 'href="#" data-resume="1"'
    )
    frag_body = re.sub(r'(src|href)="/app/static/([^"]+)"', inline_ref, body_for_frag)

    # certificate lightbox: swap the /app/static PDF link for the embedded original
    def cert_target(m):
        ref = m.group(1)                       # e.g. docs/nptel-datascience.pdf
        stem = Path(ref).stem
        target = static / "img" / "original" / f"{stem}.jpg"
        if not target.exists():
            print(f"[build] WARNING missing cert original: {ref}", file=sys.stderr)
            return m.group(0)
        return f'data-target="{data_uri(target)}"'

    frag_body = re.sub(r'data-pdf="/app/static/([^"]+)"', cert_target, frag_body)

    frag_fonts = re.sub(
        r"url\(/app/static/fonts/([^)]+)\)",
        lambda m: f"url({data_uri(static / 'fonts' / m.group(1))})",
        fonts_css,
    )
    # Streamlit's sanitiser truncates inline <script> content at the first "<"
    # (kills every `<`, `<=` and `&&` comparison). Ship the script base64-encoded
    # and decode at runtime — the inline content is then pure alphanumerics.
    js_src = JS.read_text(encoding="utf-8")
    if resume_b64:
        js_src = js_src.replace("__RESUME_B64__", resume_b64)
    js_b64 = base64.b64encode(js_src.encode("utf-8")).decode("ascii")

    fragment = (
        "<style>\n" + frag_fonts + "\n" + style_css + "\n</style>\n\n"
        + frag_body
        + "\n\n<script>eval(decodeURIComponent(escape(atob(\"" + js_b64 + "\"))))</script>\n"
    )
    OUT_FRAGMENT.write_text(fragment, encoding="utf-8")

    # ---------------------------------------------------------------- Standalone
    stand_body = (
        body.replace('src="/app/static/', 'src="')
        .replace('href="/app/static/', 'href="')
        .replace('href="docs/Ashish-Dash-Resume.pdf" target="_blank" rel="noopener"',
                 'href="docs/Ashish-Dash-Resume.pdf" download="Ashish-Dash-Resume.pdf"')
    )
    html = HEAD + stand_body + TAIL

    for sub in ("css", "js", "img", "docs", "fonts"):
        (STANDALONE / sub).mkdir(parents=True, exist_ok=True)
    (STANDALONE / ".nojekyll").touch()  # GitHub Pages: skip Jekyll processing
    (STANDALONE / "index.html").write_text(html, encoding="utf-8")
    (STANDALONE / "css" / "style.css").write_text(style_css, encoding="utf-8")
    # fonts.css lives in css/ → font URLs are one level up
    (STANDALONE / "css" / "fonts.css").write_text(
        fonts_css.replace("/app/static/fonts/", "../fonts/"), encoding="utf-8"
    )
    shutil.copy(JS, STANDALONE / "js" / "app.js")
    for sub in ("img", "docs"):
        for p in (ROOT / "static" / sub).iterdir():
            if p.is_file():
                shutil.copy(p, STANDALONE / sub / p.name)
    for p in (ROOT / "static" / "fonts").glob("*.woff2"):
        shutil.copy(p, STANDALONE / "fonts" / p.name)

    print(f"[build] {OUT_FRAGMENT.relative_to(ROOT)}      ({OUT_FRAGMENT.stat().st_size/1024:,.0f} KB)")
    print(f"[build] {STANDALONE.relative_to(ROOT)}/index.html   ({len(html)/1024:,.0f} KB)")

    # ---------------------------------------------------------------- Preview
    # One portable file: fonts + CSS + JS + images inlined as data URIs.
    # Perfect for double-click previews, email attachments and offline demos.
    inline_fonts = re.sub(
        r"url\(/app/static/fonts/([^)]+)\)",
        lambda m: f"url({data_uri(static / 'fonts' / m.group(1))})",
        fonts_css,
    )
    preview = (
        HEAD.replace('<link rel="stylesheet" href="css/fonts.css">\n<link rel="stylesheet" href="css/style.css">', "")
        .replace('<link rel="icon" type="image/png" href="img/favicon.png">',
                 f'<link rel="icon" type="image/png" href="{data_uri(static / "img" / "favicon.png")}">')
    )

    def inline_ref(m):
        whole, attr, ref = m.group(0), m.group(1), m.group(2)
        target = static / ref
        if not target.exists():
            return whole
        return f'{attr}="{data_uri(target)}"'

    preview_body = re.sub(r'(src|href)="/app/static/([^"]+)"', inline_ref, body)
    # résumé hydration happens in JS (see __RESUME_B64__), keep the plain href
    preview = (
        preview
        + "<style>\n" + inline_fonts + "\n" + style_css + "\n</style>\n"
        + preview_body
        + "\n<script>\n"
        + js_src.replace("</script>", "<\\/script>")
        + "\n</script>\n"
        + "</body>\n</html>\n"
    )
    prev_out = ROOT / "preview.html"
    prev_out.write_text(preview, encoding="utf-8")
    print(f"[build] preview.html             ({prev_out.stat().st_size/1024/1024:,.2f} MB, self-contained)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
