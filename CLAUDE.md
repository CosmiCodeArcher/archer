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
   service role key in particular must never appear in client code.
3. **Security lives in the database, not in client code.** A column list in a
   `.select()` call is a request, not a restriction — a visitor can edit it in
   devtools. Row Level Security is the actual boundary. Any new table gets RLS
   enabled and policies written in the same change that creates it.
4. **The service role key is server-side only.** Netlify Functions only.
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
mark the old one `Superseded by 00XX`. Never edit a historical record.

Write a new ADR when a change: alters a boundary between parts of the system,
picks between viable alternatives, introduces or removes a dependency, or
encodes a constraint a future reader would otherwise find arbitrary.

`docs/runbooks/` holds procedures that get executed rather than decided.

## Known problems (as of 2026-08-30)

Documented so they are not mistaken for intentional design.

**Security — in progress**
- `.env` was committed to a public repo. Credentials are being rotated. See
  `docs/runbooks/credential-rotation.md`.
- The Netlify function still authenticates with the anon key. It must move to
  the service role key. **Migration `0001_meetings_rls.sql` breaks the
  function's INSERT until this happens — do both together.**

**Correctness**
- `netlify/functions/schedule-meeting.js` fabricates a fake Google Meet link
  via `Math.random().toString(36)`. The URL does not resolve. Clients receive a
  dead link.
- Timezone handling is wrong. The frontend detects the user's IANA zone but
  the function formats confirmation emails with a hardcoded
  `America/New_York`. Fix: store `timestamptz`, send the detected zone, format
  per recipient.
- The booking function has no input validation or rate limiting. `name` and
  `notes` interpolate directly into an HTML email template.
- Double-booking has a race condition: two simultaneous submissions can both
  pass the check-then-insert. Needs a unique constraint at the database level.

**Structure — blocks the platform ambition**
- `App.jsx` renders `Layout` as a leaf route, not a layout route with
  `<Outlet />`. `/meeting`, `/contact`, `/success` have no nav or footer. No
  `errorElement` (a thrown error white-screens the site) and no 404 route.
- Content is hardcoded inside components: `projects` in `Portfolio.jsx`,
  `skills` and `journey` in `About.jsx`. This is the main blocker for adding
  articles or courses.
- `Contact.jsx` and `ContactPage.jsx` are near-duplicate forks.
- `src/` is flat. Should become feature folders.
- No code splitting. Everything loads eagerly through `Hero.jsx`.
- Dark mode is toggled imperatively via `classList.toggle` inside `Hero.jsx`
  and shares a localStorage blob with navigation state. Belongs in a provider
  at the root, applied before first paint.

**Honesty**
- `README.md` is an AI-generated handoff document, not a README. It claims
  lazy loading, memoization, ARIA labels, and keyboard navigation that do not
  exist in the code. It needs rewriting.
- `check.md` is a committed AI chat transcript containing superseded advice.
  It should be deleted.

**Accessibility**
- Bubbles in `BrandBubbles.jsx` are `<div>` with `onClick` — not keyboard
  reachable.
- Nothing respects `prefers-reduced-motion` on a site that is almost entirely
  motion.
- Modals rendered via `createPortal` have no focus trap or Escape handling.
- Carousel arrows have no accessible labels.

## Unused dependencies

Verify before removing, but these appear unused: `@calcom/embed-react` (a
hand-rolled scheduler was built instead), `dotenv` and `node-fetch` (Vite
handles env vars; Node 18+ has native fetch).

## Working agreement

- Run `npm run lint` and `npm run build` before declaring work complete.
- Do not restructure beyond what was asked. Flag adjacent problems rather than
  fixing them unprompted.
- When a task touches an item in "Known problems", update this file to reflect
  the new state.
