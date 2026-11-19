# 🚀 Push & Deploy — the 10-minute version

Everything is already built and committed in this folder. You only need to connect it
to GitHub and click a few buttons.

---

## Step 0 · One-time setup (skip if you already have Git + GitHub)

**Install Git** — <https://git-scm.com/downloads> (Windows installer, keep all defaults).

**Check it works:**

```bash
git --version
```

You should see something like `git version 2.4x.x`.

**Create a GitHub account** if you don't have one: <https://github.com/signup>
(username should ideally look professional — you already have `ashibabi2007-commits`).

---

## Step 1 · Create the empty GitHub repository

1. Go to <https://github.com/new>
2. **Repository name:** `portfolio`
3. **Visibility:** `Public` *(Streamlit Community Cloud needs public repos on the free tier)*
4. **Do NOT** tick "Add a README file", "Add .gitignore" or "Choose a license" —
   the repo must be completely empty.
5. Click **Create repository**

You'll land on a page titled *"Quick setup — if you've done this kind of thing before"*
with a URL like:

```
https://github.com/ashibabi2007-commits/portfolio.git
```

Copy it — that's your **remote URL**.

---

## Step 2 · Connect this folder to that repo

Open a terminal **inside this project folder** (the one containing `streamlit_app.py`).

> **Windows tip:** open the folder in File Explorer → click the address bar → type
> `cmd` → Enter. That opens a terminal already in the right place.
>
> **Mac tip:** right-click the folder → *Services* → *New Terminal at Folder*.

Then run these two commands (paste your own URL in the second one):

```bash
git remote add origin https://github.com/ashibabi2007-commits/portfolio.git
git push -u origin main
```

**What you should see:** an upload progress bar, then

```
branch 'main' set up to track 'origin/main'.
```

**If you're asked to log in:** GitHub no longer accepts your account password in the
terminal. Use a **Personal Access Token** instead:

1. <https://github.com/settings/tokens> → **Generate new token (classic)**
2. Note: `portfolio push` · Expiration: 90 days · Scopes: tick **`repo`**
3. Generate → **copy the token** (starts with `ghp_`)
4. When the terminal asks for a **password**, paste the token.
   When it asks for a **username**, type `ashibabi2007-commits`.

*(Or install [GitHub CLI](https://cli.github.com) and run `gh auth login` — it's easier.)*

**Verify:** refresh your repo page on github.com. You should see 76 files:
`streamlit_app.py`, `static/`, `src/`, `tools/`, `README.md`…

---

## Step 3 · Deploy on Streamlit Community Cloud

1. Go to **<https://share.streamlit.io>**
2. Click **Sign in with GitHub** → authorise.
3. Click **Create app** → choose **Deploy a public app from GitHub**.
4. Fill the form **exactly** like this:

   | Field | Value |
   |---|---|
   | **Repository** | `ashibabi2007-commits/portfolio` |
   | **Branch** | `main` |
   | **Main file path** | `streamlit_app.py` |
   | **App URL** (optional) | pick something like `ashish-dash` → `ashish-dash.streamlit.app` |

5. Click **Deploy!**

First build takes **1–2 minutes** (installing Streamlit). You'll see a log window;
when it says *"Your app is live"*, click **View app**.

> ⚠️ **If you get "ModuleNotFoundError"** — check that `requirements.txt` exists in the
> repo root. It does, so this shouldn't happen.
>
> ⚠️ **If images are broken / the page looks unstyled** — open `.streamlit/config.toml`
> in your repo and confirm this exact line exists:
> ```toml
> [server]
> enableStaticServing = true
> ```
> It's already committed; this only matters if you've edited files by hand.

---

## Step 4 · Test it like a recruiter would

Open your new URL and run through this list:

- [ ] Hero photo loads and the name animates
- [ ] Nav links jump to sections
- [ ] Skill bars fill on scroll
- [ ] Project filter chips (Data & BI / AI / ML / Engineering) work
- [ ] Click a certificate card → lightbox opens → **Open original** loads the PDF
- [ ] Terminal: type `help`, then `certs`, then `sudo hire-me` 🎉
- [ ] Résumé buttons open the PDF
- [ ] Drag the browser narrow → burger menu appears, layout stays clean
- [ ] Type `hire` on your keyboard anywhere (secret achievement)

---

## Step 5 · Put the link everywhere

Your live URL will look like:

```
https://ashish-dash.streamlit.app
```

Add it to:

- LinkedIn → **Featured** section + Contact info → Website
- Résumé header (replace the old Vercel link)
- GitHub profile README
- Email signature

---

## 🔁 After that: how to update the site

Edit the source files, rebuild, push:

```bash
# 1. edit   src/body.html        (copy, sections, text)
#           static/css/style.css (colours, spacing, layout)
#           static/js/app.js     (interactions)

# 2. rebuild the served bundle
python tools/build.py

# 3. ship it
git add -A
git commit -m "Update projects section"
git push
```

Streamlit Cloud auto-redeploys ~30 seconds after the push.

> **Golden rule:** never hand-edit `static/portfolio.html` — it's generated by
> `tools/build.py` and your changes will be overwritten on the next build.

---

## 🧯 Troubleshooting

| Symptom | Fix |
|---|---|
| `error: remote origin already exists` | `git remote set-url origin https://github.com/ashibabi2007-commits/portfolio.git` |
| `error: src refspec main does not match any` | You're not on `main`: `git branch -M main` then push again |
| `Authentication failed` | Use a Personal Access Token (Step 2), not your password |
| `Updates were rejected… fetch first` | The GitHub repo wasn't empty: `git pull --rebase origin main` then push |
| Streamlit app shows "Site bundle not found" | Run `python tools/build.py`, commit `static/portfolio.html`, push |
| Fonts look like Times New Roman | `static/fonts/*.woff2` didn't get committed — check `git ls-files static/fonts` |
| Deploy stuck on "Installing dependencies" | Normal for the first build; give it 3–4 minutes |
| App sleeping | Free tier sleeps after inactivity; first visit after that takes ~20s to wake |

---

## 🌐 Bonus: deploy the plain-HTML version too (optional)

`standalone/` is a complete static copy — no Streamlit needed.

**Netlify (30 seconds):** <https://app.netlify.com/drop> → drag the `standalone` folder → done.

**GitHub Pages:** repo → **Settings** → **Pages** → *Deploy from a branch* →
Branch `main`, folder **`/standalone`** → **Save**. Live at
`https://ashibabi2007-commits.github.io/portfolio/`

**Why bother?** A static host loads faster and never sleeps — useful if you want to
share the link on a résumé where cold-start delays look bad.

---

## 📊 Quick reference

| Thing | Value |
|---|---|
| Entry point | `streamlit_app.py` |
| Built bundle | `static/portfolio.html` (85 KB, regenerated by `tools/build.py`) |
| Build command | `python tools/build.py` |
| Repo size | ~9 MB (fonts + certificate images included) |
| External requests | **none** — fonts self-hosted, no CDN, no analytics, no API keys |
| Port locally | `streamlit run streamlit_app.py` → <http://localhost:8501> |
| Instant offline preview | double-click `preview.html` |
