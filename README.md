# Find Your Ownership — KE&G ESOP Games

A 4-game ESOP engagement app: Word Search, Crossword, Myth or Fact, and Trivia.
Employees sign in with their employee number + name. You unlock games, bulk-load
the roster, edit every question/answer, and track completions — all without
touching code.

**Stack:** React (Vite) on Netlify + Netlify Functions (serverless backend) +
Supabase (Postgres database).

---

## 1. Create the Supabase project (the database)

1. Go to [supabase.com](https://supabase.com) → New project. Free tier is plenty for this.
2. Once it's created, open **SQL Editor** → New query, paste in the contents of
   `supabase/schema.sql` from this repo, and run it. This creates the 4 tables
   (`employees`, `games`, `questions`, `completions`) and seeds all 4 games with
   the exact questions/answers from your document.
3. Go to **Project Settings → API**. You'll need two values for step 3 below:
   - **Project URL** (this is `SUPABASE_URL`)
   - **service_role key** (this is `SUPABASE_SERVICE_ROLE_KEY`) — this is a secret,
     admin-level key. It never goes in the frontend code; it's only used inside
     the Netlify Functions.

**Loading data directly:** Since you want to load employees/questions directly
into the backend — you can. Supabase's **Table Editor** lets you open the
`employees` table and use "Insert → Import data from CSV" to bulk-load your
roster straight into the database, no app UI needed. Same goes for editing
`questions` rows directly if you ever want to bypass the admin panel. The admin
panel in the app is just a friendlier wrapper around the same tables.

## 2. Push this repo to GitHub

```bash
cd esop-games
git init
git add .
git commit -m "Initial commit: ESOP games app"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/esop-games.git
git push -u origin main
```

## 3. Connect to Netlify

1. In Netlify: **Add new site → Import an existing project → GitHub** → select this repo.
2. Build command: `npm run build` — Publish directory: `dist` (already set in `netlify.toml`).
3. Go to **Site configuration → Environment variables** and add:

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | from Supabase Project Settings → API |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase Project Settings → API |
   | `ADMIN_PASSWORD` | `K3&GM@rketing` |

4. Deploy. Netlify will build the React app and deploy the functions in
   `netlify/functions/` automatically.

**On the admin password:** it lives only as a Netlify environment variable —
it's never committed to GitHub and never shipped in the frontend bundle. The
`.gitignore` in this repo also blocks any local `.env` file from being
committed by accident. If you ever want to rotate it, just update the env var
in Netlify and redeploy (no code change needed).

## 4. Try it locally (optional)

```bash
npm install -g netlify-cli   # once
npm install
netlify dev
```

`netlify dev` runs the Vite frontend and the serverless functions together, so
sign-in, game data, and the admin panel all work locally. It reads env vars
from a local `.env` file (copy `.env.example` → `.env` and fill in your own
Supabase project's values for local testing only — don't commit it).

---

## Using the app

### Employees
Go to `/` → sign in with employee number + name (must match a row in the
`employees` table exactly). They'll only see games you've unlocked.

### Admin
Go to `/admin` → enter the admin password.

- **Games tab:** flip each game Unlocked/Locked. This is the "unlock on the
  back end" switch — flip it whenever you're ready for employees to play that
  week's game.
- **Employees tab:** upload a CSV (two columns: employee number, name) to
  bulk-add or update the roster. You can also do this directly in Supabase's
  Table Editor, as described above.
- **Questions tab:** pick a game, edit any question/answer/word, add new ones,
  or delete them. The word search and crossword grids are generated
  automatically from whatever words/clues are in this list — you never have to
  place them on a grid by hand.
- **Completions tab:** see which employees have completed which games, with a
  CSV export button for reporting.

## How content maps to each game

| Game | What each question row needs |
|---|---|
| Word Search | A single word or phrase (e.g. `SHARE VALUE`) |
| Crossword | A clue and an answer |
| Myth or Fact | A statement, the answer (`MYTH` or `FACT`), and an optional explanation |
| Trivia | A question, a list of options (one per line), and which option number is correct (0 = first option) |

## A couple of honest limitations, so nothing surprises you

- **Sign-in is identity matching, not secure authentication.** Employee number
  + name is enough to get in — there's no password for employees. That's a
  reasonable trade-off for an internal engagement game, but don't reuse this
  pattern for anything sensitive.
- **Quiz answers are visible in the browser's network tab** if someone digs
  for them (the questions API sends the full payload, including correct
  answers, so the game can grade instantly client-side). Fine for a fun
  culture-building game; not built to resist a determined cheater.
- **The admin password is a single shared password**, not individual admin
  accounts. Good enough for one or two people managing this; if you ever want
  per-person admin logins, that's a bigger change (real auth via Supabase Auth).
