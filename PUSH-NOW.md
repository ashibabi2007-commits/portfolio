# ⚡ Push the fixed site — 2 commands

Your repo exists. The zip in this workspace is **already a git repo** on branch `main`,
clean, with the fix committed. You just add the remote and push.

---

## 1 · Unzip over your old folder (or into a new one)

Download **`portfolio-repo.zip`** → right-click → **Extract All** → e.g.
`C:\Users\ashib\portfolio`

> ⚠️ Extract the **whole zip**. The hidden `.git` folder is inside it.
> If your extractor skips hidden files, use the "No git? Rebuild" block below.

---

## 2 · Push

**PowerShell**, inside the extracted folder (the one with `streamlit_app.py`):

```powershell
cd C:\Users\ashib\portfolio
git remote add origin https://github.com/ashibabi2007-commits/portfolio.git
git push -u origin main
```

If the remote already exists from your earlier attempt:

```powershell
git remote set-url origin https://github.com/ashibabi2007-commits/portfolio.git
git push -u origin main --force
```

(`--force` is safe here — the GitHub repo only has your own failed attempts or nothing.)

### No git history in the folder? Rebuild it in 20 seconds

```powershell
git init
git branch -M main
git config user.name "Ashish Dash"
git config user.email "ashibabi2007@gmail.com"
git add -A
git commit -m "Ashish Dash portfolio"
git remote add origin https://github.com/ashibabi2007-commits/portfolio.git
git push -u origin main
```

---

## 3 · Confirm the fix landed

```powershell
git ls-files static/portfolio.html
```

Then check the file is the **big** one (≈3.3 MB, not 85 KB):

```powershell
(Get-Item static\portfolio.html).Length
```

`3300000`-ish → you have the fix. `85000`-ish → you're on the old copy; re-extract the zip.

---

## 4 · Streamlit will redeploy by itself

Because the app is already connected to the repo, pushing triggers a rebuild.
Open [share.streamlit.io](https://share.streamlit.io) → your app → **⋮ → Reboot app**
if it doesn't refresh within a minute.

**Hard-refresh the browser** afterwards: `Ctrl + Shift + R`
(Streamlit caches aggressively — an old render can stick around.)

---

## What was wrong, and why it can't happen again

Your screenshot showed the nav bar only — CSS loaded, JavaScript didn't. Two culprits,
both now eliminated:

| Cause | Fix |
|---|---|
| `.streamlit/` was missing from the repo, so Streamlit served no static files (`/app/static/js/app.js` → 404) | The bundle is now **fully self-contained**: fonts, 11 images, all 10 certificate originals and the résumé are inlined as data URIs |
| Streamlit's HTML sanitiser **truncates inline `<script>` at the first `<`** — which silently destroyed every `i < n` comparison in the JS | The script is now shipped **base64-encoded** and decoded at runtime, so the inline content is pure alphanumerics |

Result: the page renders with `enableStaticServing = false` **and** with no `.streamlit`
folder at all. I tested exactly that — a clean clone with `.streamlit` deleted — and it
rendered pixel-identical, with working terminal, lightbox and toasts.

---

## If it still looks broken

Send me a screenshot, and check these two things first:

```powershell
# 1. Is the big bundle really on GitHub?
#    Open in a browser: https://raw.githubusercontent.com/ashibabi2007-commits/portfolio/main/static/portfolio.html
#    → should be ~3.3 MB of text, not a few KB

# 2. Did Streamlit pick it up?
#    In the app: ⋮ menu → Reboot app → then Ctrl+Shift+R in the browser
```
