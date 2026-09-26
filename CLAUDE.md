# CLAUDE.md

Project context for Claude Code. Read at the start of every session.

## What this project is

A personal portfolio site that is intended to grow into a general-purpose
personal platform. Planned future wings include long-form writing, interactive
courses, small games, and a private "vault" for personal data.

The owner's stated intent: **anything he learns gets built into this codebase.**
Treat the site as a living workshop rather than a finished brochure. New
features are expected to arrive frequently and unpredictably.

**Design implication:** favour architecture that absorbs new sections without
requiring changes to existing ones. Prefer adding a folder over editing a
switch statement. If a change to add feature B requires touching feature A,
that's a signal the boundary is in the wrong place.

**Counterweight:** the site is also a job-seeking and client-facing artifact.
The front door must stay fast, honest, and legible. Playfulness in the
experience is intentional and should be preserved. Sprawl and dead code are not
the same thing as playfulness.

## Stack

- Vite 5 + React 18, JavaScript (not TypeScript)
- Tailwind 3, `darkMode: 'class'`
- React Router 6
- Framer Motion, react-tilt, @use-gesture/react, react-countup
- Supabase (Postgres) for booking persistence
- Netlify hosting + Netlify Functions, nodemailer for transactional email

## The owner is learning

Explain reasoning as you work, not just conclusions. When you make a
non-obvious choice, say what you rejected and why. When you use a term that a
self-taught developer may not have met (diff, migration, race condition, RLS,
tree-shaking), define it briefly in passing rather than assuming.

Prefer small, reviewable commits over large ones. The diff is the primary
teaching surface.

## Hard rules

These are not stylistic preferences. Violating them causes real harm.

1. **Never commit secrets.** `.env` is gitignored. `.env.example` documents
   variable names with no values.
2. **`VITE_` means public.** Vite inlines any `VITE_`-prefixed variable into
   the browser bundle. Never prefix a true secret with `VITE_`. The Supabase
   secret key (`sb_secret_…`, the successor to the service role key) in
   particular must never appear in client code.
3. **Security lives in the database, not in client code.** A column list in a
   `.select()` call is a request, not a restriction — a visitor can edit it in
   devtools. Row Level Security is the actual boundary. Any new table gets RLS
   enabled and policies written in the same change that creates it.
4. **The Supabase secret key is server-side only.** Netlify Functions only.
   Browser code uses the publishable key (`sb_publishable_…`). Legacy
   `anon` / `service_role` keys are being retired — see ADR 0003. New code
   must not introduce them.
5. **No personal data in public views.** `public.booked_slots` exposes only
   date and time on purpose. Do not add columns to it without checking.

## Conventions

- **Identity and contact details** live in `src/config/site.js`, never
  hardcoded in components. They were previously duplicated across three files
  and drifted apart.
- **Environment access** goes through `src/lib/env.js`, which validates at
  import time. Do not read `import.meta.env` directly in components.
- **The Supabase client** is a singleton in `src/lib/supabase.js`. Do not call
  `createClient` anywhere else.
- **SQL migrations** are numbered files in `supabase/migrations/`, applied by
  hand via the Supabase SQL editor. One concern per migration.
- **Tailwind gradient classes must be complete literal strings** in the source.
  Building them dynamically (`from-${color}-400`) produces classes the JIT
  compiler never generates.

## Decision log

`docs/DECISIONS.md` indexes numbered ADRs in `docs/decisions/`.

**Read the index before making architectural changes.** Several current
oddities are deliberate and documented.

Records are **append-only**. To change a past decision, write a new record and
mark the old one `Superseded by 00XX`. Only two edits to an old record are
allowed: updating its Status line, and adding a dated Erratum above Context
to correct a factual error (the wrong text stays in place). Never rewrite
Context, Decision, Reasoning or Consequences. `docs/DECISIONS.md` has the full
rule.

Write a new ADR when a change: alters a boundary between parts of the system,
picks between viable alternatives, introduces or removes a dependency, or
encodes a constraint a future reader would otherwise find arbitrary.

`docs/runbooks/` holds procedures that get executed rather than decided.

## Roadmap

`docs/ROADMAP.md` is the plan: phases (P1, P2 …), their steps (P1.1 …), the
order, and the reasons for it. Before starting work, find the step it belongs
to. If it doesn't fit any step, it goes in the roadmap's Ideas inbox rather
than into the code. When a step is completed, update its status in the same
commit.

## Known problems (as of 2026-09-26)

Documented so they're not mistaken for intentional design. Each item ends with
the roadmap step that fixes it. When a step lands, delete its lines here.

**Security**
- Legacy Supabase keys (`anon`, `service_role`) in use everywhere; Supabase
  deprecates them by the end of 2026. See ADR 0003. → P1.3
- `meetings` is readable by anyone holding the public key until
  `supabase/migrations/0001_meetings_rls.sql` is applied. → P1.3
- The Netlify function authenticates with the **anon** key. The RLS migration
  breaks its INSERT until it holds the secret key: apply them together, in the
  order given in ROADMAP P1.3. → P1.3
- Env var names are inconsistent. The function reads `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `YOUR_EMAIL`. Target names are in ADR 0003 and
  `.env.example` — except that `.env.example` still lists
  `SUPABASE_SERVICE_ROLE_KEY`, now superseded by `SUPABASE_SECRET_KEY`.
  → P1.2, P1.3
- The booking function has no input validation, output escaping or rate
  limiting. `name` and `notes` land raw in an HTML email. → P1.2
- `nodemailer` has open advisories, including SMTP command injection. The fix
  is a major upgrade. → P1.2
- `.env` was never committed (verified 2026-09-26; ADR 0001 erratum).
  Rotation is scheduled hygiene. → P0.3

**Correctness**
- The time model is wrong in three ways: slots are defined in the *visitor's*
  timezone; the server stores a date and time derived from its own UTC clock;
  and `isTimeSlotBooked` compares against a date shifted by `toISOString()`,
  which lands a day early for anyone east of UTC, including the owner's own
  zone (WAT, UTC+1). Emails are formatted in a hardcoded `America/New_York`.
  Worked example in ROADMAP P1.4. → P1.4
- The `meetings` table's schema isn't version-controlled: no migration creates
  it, so column types and nullability are unknown from the repo (P1.1 stores
  `''` rather than `null` in `meet_link` for that reason). P1.4's migration
  needs the real schema first: export it into
  `supabase/migrations/0000_meetings_baseline.sql`. → P1.4
- Double-booking race: check-then-insert with no unique constraint. → P1.4
- Supabase pauses free projects after about 7 days of low activity. Nothing
  keeps it awake, and nothing alerts on failure. → P1.5
- `BehindTheWork.jsx` references `/behind-the-work/01.jpg` and `02.jpg`, which
  were deleted in `8fc2731`. Visitors see broken images. → P2.5

**Honesty**
- `README.md` is an AI-generated handoff document. It claims lazy loading,
  memoization, ARIA labels and keyboard navigation that don't exist. → P2.1
- `check.md` is a committed AI chat transcript of superseded advice. → P2.1

**Quality**
- `npm run lint`: 19 errors, all pre-existing: 14
  `react/no-unescaped-entities`, 4 `react/prop-types`, 1 `no-unused-vars`.
  (The 8 `no-undef` in the function were cleared in P1.1 by linting
  `netlify/functions/` as Node code.) Until P2.2, "no new errors" means the
  count doesn't go up. → P2.2
- `npm audit`: 25 vulnerable packages (17 high), mostly build tooling.
  Runtime-relevant: `react-router`, `nodemailer`. → P1.2, P2.3
- Unused dependencies, confirmed unimported 2026-09-26: `@calcom/embed-react`,
  `dotenv`, `node-fetch`, `date-fns` (P1.4 may adopt `date-fns`). → P2.3
- `prop-types` is imported by components but isn't in `package.json`. It only
  resolves because `eslint-plugin-react`, a dev dependency, happens to install
  it. Declare it, or drop the imports, depending on P2.2's prop-types
  decision. → P2.2, P2.3
- `package.json` sets `"type": "module"`, so plain Node refuses the CommonJS
  function (`require` in an ES module). It works only because Netlify's
  bundler converts it. → P1.2

**Accessibility**
- Bubbles in `BrandBubbles.jsx` are `<div>`s with `onClick`: not keyboard
  reachable. → P2.4
- Nothing respects `prefers-reduced-motion` on a site that is almost entirely
  motion. → P2.4
- Modals rendered via `createPortal` have no focus trap or Escape handling.
  → P2.4
- Carousel arrows have no accessible labels. → P2.4

**Structure: blocks the platform ambition**
- `App.jsx` renders `Layout` as a leaf route, not a layout route with
  `<Outlet />`. `/meeting`, `/contact` and `/success` have no nav or footer.
  No `errorElement` (a thrown error white-screens the site) and no 404.
  → P3.1
- `src/` is flat; `Contact.jsx` and `ContactPage.jsx` are near-duplicate
  forks. → P3.2
- Content is hardcoded inside components: `projects` in `Portfolio.jsx`,
  `skills` and `journey` in `About.jsx`. The main blocker for articles and
  courses. → P3.3
- No code splitting: one 627 kB JavaScript bundle (185 kB gzipped). → P3.4
- Dark mode is toggled imperatively in `Hero.jsx` and shares a localStorage
  blob with navigation state. Belongs in a provider at the root, applied
  before first paint. → P3.5
- Absolute `https://cc-archer.netlify.app/…` URLs are hardcoded in four
  components and the function's email templates. → P4.1

## Working agreement

- Run `npm run lint` and `npm run build` before declaring work complete.
  Until ROADMAP P2.2 lands, lint has 19 pre-existing errors: report the count
  before and after, and treat any increase as a failure.
- Do not restructure beyond what was asked. Flag adjacent problems rather than
  fixing them unprompted.
- When a task touches an item in "Known problems", update this file to reflect
  the new state.
- Patches arriving from a Claude chat review session are applied per
  `docs/runbooks/applying-patches.md`: `git apply --check --3way` first, stage
  with `git apply --3way`, show the staged diff, and wait for the owner's
  approval before committing. If a patch fails, report which hunk failed and
  stop. Never hand-edit a patch to force it through.
- After applying a patch or finishing a local task, write a review bundle per
  `docs/runbooks/review-bundles.md`, stored outside the repo. Never include
  secret values.
