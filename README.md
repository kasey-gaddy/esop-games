# Find Your Ownership — KE&G ESOP Games

A 4-game ESOP engagement app: Word Search, Crossword, Myth or Fact, and Trivia.
Employees sign in with their employee number + name. You unlock games, bulk-load
the roster, edit every question/answer, and track completions — all without
touching code.

**Stack:** plain HTML + React loaded from a CDN (no build step, matches the
same single-file pattern as the KE&G Employee Choice Awards app) + a Netlify
Function backed by **Netlify Blobs** — Netlify's own built-in key-value store.
No Supabase, no Google Sheets, no service account, no separate database to
provision. The only thing you configure is one password.

## What's in this repo

```
index.html    → the page shell: loads React, Babel, and app.jsx from a CDN
app.jsx       → the entire app (sign-in, games, admin panel)
styles.css    → styling
netlify/functions/storage.js  → generic get/set/delete/list backed by Netlify Blobs
netlify/functions/report.js   → admin-only completions report (one aggregated call)
```

## 1. Push this repo to GitHub

```bash
cd esop-games
git init
git add .
git commit -m "Initial commit: ESOP games app"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/esop-games.git
git push -u origin main
```

## 2. Connect to Netlify

1. **Add new site → Import an existing project → GitHub** → select this repo.
2. Build settings: leave the build command **blank** — this is a static site,
   nothing to compile. Publish directory: `.` (already set in `netlify.toml`).
3. Go to **Site configuration → Environment variables** and add just one:

   | Key | Value |
   |---|---|
   | `ADMIN_PASSWORD` | `K3&GM@rketing` |

4. Deploy. That's it — no database URL, no API key, no service account.
   Netlify Blobs is available to your site's functions automatically the
   moment the site is deployed on Netlify.

## 3. First-time setup in the app

1. Visit your deployed site and click **Admin login** → enter the admin password.
2. Go to the **Games** tab → click **Load the 4 default ESOP games**. This
   loads all 4 games (locked) with every question/answer from your original
   document, pre-filled and ready to edit.
3. Go to the **Employees** tab → upload a CSV or Excel file with your roster
   (two columns: employee number, name).
4. Flip games unlocked from the **Games** tab whenever you're ready for that
   week.

## Using the app

- **Employees** go to your site's root URL, sign in with employee number +
  name (must match a row you uploaded), and see only unlocked games.
- **Admin** (`Admin login` link on the sign-in page):
  - **Games** — the unlock/lock switch per game, plus a button to reload the
    default content if you ever want to reset it.
  - **Employees** — bulk upload/update the roster.
  - **Questions** — edit, add, or delete any question/answer/word for any
    game. The word search and crossword grids regenerate automatically from
    whatever's in this list — nothing to place on a grid by hand.
  - **Completions** — who's finished what, with a CSV export button.

## How content maps to each game

| Game | What each question needs |
|---|---|
| Word Search | A single word or phrase (e.g. `SHARE VALUE`) |
| Crossword | A clue and an answer |
| Myth or Fact | A statement, the answer (`MYTH` or `FACT`), and an optional explanation |
| Trivia | A question, a list of options (one per line), and which option number is correct (0 = first option) |

## How the data is stored

Everything lives in Netlify Blobs as a handful of JSON values:

- `games:list` — the 4 games and their locked/unlocked state
- `questions:<gameId>` — that game's questions
- `employees:list` — the roster
- `completions:<employeeNumber>:<gameId>` — one per finished game

You'll never need to touch these directly, but it's worth knowing there's no
separate dashboard to log into — everything is managed from `/admin` in the app.

## Local development (optional)

```bash
npm install -g netlify-cli   # once
netlify dev
```

`netlify dev` serves the static files and runs the functions (including Blobs)
locally, using a `.env` file for `ADMIN_PASSWORD` if you want to test before deploying.

## A couple of honest limitations, so nothing surprises you

- **Sign-in is identity matching, not secure authentication.** Employee
  number + name gets someone in — there's no employee password. Reasonable
  for an internal engagement game; don't reuse this pattern for anything
  sensitive.
- **Reads are open.** Anyone with the site URL can technically call the
  storage function directly and read the roster or game questions (including
  quiz answers) — writes to games/employees/questions require the admin
  password, but reads don't. Fine for a fun culture-building game; not built
  to resist a determined cheater or to hold sensitive data.
- **The admin password is a single shared password**, not individual admin
  accounts. Good enough for one or two people managing this.
