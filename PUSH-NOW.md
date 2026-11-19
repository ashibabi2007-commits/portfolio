# ⚡ Push to your new repo — 2 commands

You've created the repo. This folder is **already a git repo** with everything committed
on branch `main`, no remote attached yet. So you only need two commands.

---

## 1 · Get this folder onto your computer

Download **`portfolio-repo.zip`** from this workspace and unzip it somewhere simple, e.g.

```
Desktop/portfolio
```

> ✅ The `.git` folder is inside the zip (it's a hidden folder — on Windows turn on
> *View → Show → Hidden items* if you want to see it). Extract the **whole zip**,
> don't pick individual files, or git history won't come along.

---

## 2 · Open a terminal in that folder

- **Windows:** open the folder in File Explorer → click the address bar → type `cmd` → Enter
- **Mac:** right-click the folder → *Services* → *New Terminal at Folder*
- **Linux:** right-click → *Open in Terminal*

Check you're in the right place:

```bash
ls          # mac/linux
dir         # windows
```

You should see `streamlit_app.py`, `static`, `src`, `README.md`…

---

## 3 · Push

Replace the URL with **your** new repo's URL (the one GitHub showed you after creating it):

```bash
git remote add origin https://github.com/ashibabi2007-commits/portfolio.git
git push -u origin main
```

Done. Refresh GitHub — you should see 76 files and 2 commits.

---

### 🔑 If it asks for a password

GitHub won't accept your account password. Use a token:

1. <https://github.com/settings/tokens> → **Generate new token (classic)**
2. Note: `portfolio` · Expiration: 90 days · Scope: tick **`repo`**
3. **Generate token** → copy it (starts with `ghp_`)
4. Username → `ashibabi2007-commits` · Password → **paste the token**

---

## 4 · Deploy

<https://share.streamlit.io> → **Create app** → *Deploy a public app from GitHub*

| Field | Value |
|---|---|
| Repository | `ashibabi2007-commits/portfolio` |
| Branch | `main` |
| Main file path | `streamlit_app.py` |

**Deploy** → live in ~2 minutes.

---

## Common bumps

| Message | Fix |
|---|---|
| `remote origin already exists` | `git remote set-url origin <your-url>` then push |
| `src refspec main does not match any` | You're on `master`: `git branch -M main` then push |
| `Authentication failed` | Use the token, not your password (above) |
| `Updates were rejected` | Repo wasn't empty: `git pull --rebase origin main` then push |
| `fatal: not a git repository` | You're in the wrong folder, or didn't unzip the hidden `.git` folder |
| `'git' is not recognized` | Install Git: <https://git-scm.com/downloads>, then reopen the terminal |

---

## Alternative if the terminal is fighting you: GitHub Desktop

1. Install <https://desktop.github.com>
2. **File → Add local repository** → pick the unzipped `portfolio` folder
3. It may say "this isn't a repository" → click **create a repository** with that path
4. Click **Publish repository** → untick *Keep this code private*
5. Push. Then deploy on Streamlit as in step 4.

---

## After the first push

```bash
# edit src/body.html, static/css/style.css or static/js/app.js, then:
python tools/build.py
git add -A
git commit -m "Update content"
git push
```

Streamlit redeploys about 30 seconds after each push.
