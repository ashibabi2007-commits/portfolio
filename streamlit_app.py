"""
Ashish Dash — portfolio
──────────────────────────────────────────────────────────────────────────────
Streamlit entry point.  The site itself is a hand-built HTML/CSS/JS document
(src/template.html → static/portfolio.html); Streamlit acts as a thin, reliable
host so the whole thing deploys to Streamlit Community Cloud in one click.

Local:
    pip install -r requirements.txt
    streamlit run streamlit_app.py

Deploy:
    push to GitHub → share.streamlit.io → New app → select this repo → done.
"""

from pathlib import Path

import streamlit as st

ROOT = Path(__file__).parent
SITE = ROOT / "static" / "portfolio.html"

st.set_page_config(
    page_title="Ashish Dash — Data Analyst in the making",
    page_icon=str(ROOT / "static" / "img" / "favicon.png"),
    layout="wide",
    initial_sidebar_state="collapsed",
)

# -----------------------------------------------------------------------------
# 1. Strip Streamlit's chrome so the page is truly full-bleed.
#    (Header / toolbar / footer / default paddings.)
# -----------------------------------------------------------------------------
st.html(
    """
<style>
  #MainMenu, footer, header[data-testid="stHeader"], [data-testid="stToolbar"],
  [data-testid="stDecoration"], [data-testid="stStatusWidget"],
  [data-testid="stSidebarCollapsedControl"] { display: none !important; }

  html, body, [data-testid="stApp"], [data-testid="stAppViewContainer"],
  [data-testid="stMain"] { background: #F7F2E8 !important; }

  [data-testid="stMainBlockContainer"], .block-container {
    padding: 0 !important;
    max-width: 100% !important;
  }
  [data-testid="stMainBlockContainer"] > div { gap: 0 !important; }
  [data-testid="stVerticalBlock"] { gap: 0 !important; }
  [data-testid="stElementContainer"] { margin: 0 !important; }

  /* The site owns the viewport; hide anything Streamlit might paint around it */
  [data-testid="stAppViewContainer"] > .main { overflow: visible !important; }
</style>
""",
    unsafe_allow_javascript=True,
)

# -----------------------------------------------------------------------------
# 2. Mount the portfolio.
#    st.html(unsafe_allow_javascript=True) inserts the document inline (same
#    origin), so /app/static/... image + PDF paths resolve correctly.
# -----------------------------------------------------------------------------
if not SITE.exists():
    st.error(
        "**Site bundle not found.** Run `python tools/build.py` first "
        "(or redeploy — `static/portfolio.html` must be committed)."
    )
    st.stop()

SITE_HTML = SITE.read_text(encoding="utf-8")
st.html(SITE_HTML, unsafe_allow_javascript=True)
