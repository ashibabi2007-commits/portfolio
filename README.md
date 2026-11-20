# Ashish Dash — Portfolio

A hand-built, fully interactive portfolio that runs inside **Streamlit Community Cloud**
(and as plain static HTML anywhere else).

Warm-paper editorial design · custom cursor · scroll XP bar · achievement toasts ·
an actual working terminal · certificate lightbox · confetti · and a small easter egg
if you type `hire` on your keyboard.

---

## ✨ What's inside

| Section | What it does |
|---|---|
| **Hero** | Animated name, typewriter role rotator, floating CGPA / NPTEL / chai stickers |
| **About** | Story + "currently, precisely" card + three field notes |
| **Skills** | Animated capability bars with honest one-line commentary |
| **Work** | 5 project case files with filter chips (Data & BI / AI / ML / Engineering) |
| **Credentials** | All 10 certificates — click (or press Enter) any card to open a hi-res lightbox with a download |
| **Journey** | Non-linear timeline from school → internships → "open to work" |
| **Playground** | A working terminal: `help`, `whoami`, `skills`, `certs`, `joke`, `chai`, `sudo hire-me` |
| **Contact** | Email / LinkedIn / GitHub / phone + one-click résumé download |

**Extras thrown in:** scroll-progress XP bar, achievement toasts at milestones,
confetti on `sudo hire-me`, contextual tab titles, custom cursor, grain overlay,
`prefers-reduced-motion` support, and full mobile layout.

---

## 📁 Repo layout

```
streamlit_app.py          ← Streamlit entry point (this is what Streamlit Cloud runs)
requirements.txt
.streamlit/config.toml    ← enables static file serving + theme
src/body.html             ← the page markup  ← EDIT COPY HERE
static/
  css/style.css           ← design system        ← EDIT STYLES HERE
  js/app.js               ← all interactions     ← EDIT BEHAVIOUR HERE
  fonts/                  ← self-hosted woff2 (no Google Fonts requests)
  img/                    ← photos + certificate thumbnails
  docs/                   ← résumé + original certificate PDFs
  portfolio.html          ← BUILT fragment served to Streamlit (do not hand-edit)
tools/build.py            ← build script
standalone/index.html     ← built plain-HTML version (Netlify / GitHub Pages)
preview.html              ← built single-file version (works offline, double-click)
```

> **Golden rule:** edit `src/body.html`, `static/css/style.css` or `static/js/app.js`,
> then run `python tools/build.py` to regenerate `static/portfolio.html`.
> Editing the built files directly means the next build overwrites your work.

---

## 🖥 Run it locally

```bash
git clone https://github.com/ashibabi2007-commits/portfolio.git
cd portfolio
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Open <http://localhost:8501>.

**Rebuild after edits:**

```bash
python tools/build.py
```

(Only needs the Python standard library.)

**Instant preview without Python:** just double-click `preview.html` — fonts, styles,
scripts and images are all inlined into that one file.

---

## 🚀 Deploy to Streamlit Community Cloud

1. Push this repo to GitHub (steps below).
2. Go to <https://share.streamlit.io> → **Create app** → **Deploy a public app from GitHub**.
3. Fill in:
   - **Repository:** `ashibabi2007-commits/portfolio`
   - **Branch:** `main`
   - **Main file path:** `streamlit_app.py`
4. Click **Deploy**. First build takes ~1–2 minutes.
5. You get `https://<something>.streamlit.app` — that's the link for your résumé.

**Requirements for this to work (already handled in the repo):**
- `static/portfolio.html` must be committed — Streamlit reads it at runtime.
- `.streamlit/config.toml` keeps `enableStaticServing = true` so `/app/static/...`
  images, fonts and PDFs resolve.
- Everything the site needs lives inside `static/` — no external CDNs, no API keys,
  no personal data in Streamlit secrets.

---

## 🌐 Optional: also deploy the plain-HTML version

The same design ships as a normal static site in `standalone/`.

**Netlify (drag & drop):** open <https://app.netlify.com/drop> → drag the `standalone`
folder → done.

**GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → Branch `main`,
folder `/standalone` → Save. (`.nojekyll` is already included.)

---

## 🧪 Smoke-test checklist before you share the link

- [ ] Hero photo loads, name animates in
- [ ] Nav links jump to the right sections (offset clears the sticky nav)
- [ ] Skills bars fill when scrolled into view
- [ ] Project filter chips work
- [ ] Each of the 10 certificate cards opens a lightbox; "Open original" loads the PDF
- [ ] Terminal: `help`, `whoami`, `certs`, `sudo hire-me`
- [ ] Résumé buttons download/open the PDF
- [ ] Mobile: burger menu opens, hero reads name → photo → copy
- [ ] Tab title changes when you switch tabs (small delight, zero cost)

---

## 📄 Notes

- Text, numbers and dates are drawn from the résumé and the ten uploaded certificates
  (CTA is treated as *Central Tool Room & Training Centre*).
- Certificate images are thumbnails for display; the lightbox links to the original PDF/JPEG.
- No analytics, no cookies, no tracking.

---

Built by hand — no template was harmed.
