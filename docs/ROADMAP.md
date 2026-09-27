# Roadmap

**Living document.** Last updated 2026-09-27 (hotfix 0008).
**Where we are:** phase P1 is in progress. Hotfix 0007 restored deploys; the
first test booking then showed the code still used the legacy Supabase keys,
which you had disabled earlier. Hotfix 0008 pulls P1.3 forward to fix it. After that: P1.1's done-when
checks, P1.0, then P1.2.

This is the plan for turning the portfolio into a platform, without breaking
what's live along the way. It says *what* happens in *what order*, and *why
that order*. The decision log (`docs/decisions/`) says why things are built
the way they are. `CLAUDE.md` lists what's broken right now, with each item
tagged by the roadmap step that fixes it.

## Contents

- [How to read this](#how-to-read-this)
- [North star](#north-star)
- [Why this order](#why-this-order)
- [At a glance](#at-a-glance)
- [P0 — Groundwork](#p0--groundwork)
- [P1 — Nothing lies to a visitor](#p1--nothing-lies-to-a-visitor)
- [P2 — Honest front door](#p2--honest-front-door)
- [P3 — Platform foundations](#p3--platform-foundations)
- [P4 — Professional identity and integrations](#p4--professional-identity-and-integrations)
- [P5 — The Lab](#p5--the-lab)
- [Horizon](#horizon)
- [Ideas inbox](#ideas-inbox)
- [Working the roadmap](#working-the-roadmap)
- [Change log](#change-log)

---

## How to read this

The plan is split into **phases** (P1, P2 …), each with a goal and an **exit
gate**: the conditions that must be true before the next phase starts. Each
phase is split into **steps** (P1.1, P1.2 …).

Every step lists:

- **What** — the change.
- **Why** — the reason, including what was rejected.
- **Done when** — how we'll know. Written as checks, not feelings.
- **You'll learn** — the concepts the step teaches. This project exists partly
  to teach, so learning is treated as a deliverable.

**Delivery modes** say who does the work:

| Mark | Mode | Who |
|---|---|---|
| 📦 | **Patch** | The chat session writes and verifies it against GitHub. Claude Code applies it. You review and commit. |
| 🖥 | **Local task** | Needs your machine (for example, regenerating the lockfile). Delivered as a brief inside a patch; Claude Code carries it out. |
| 👤 | **Owner** | Only you can do it: accounts, dashboards, secrets, and decisions. |

**Effort** is *your* time, roughly: reviewing diffs, doing 👤 steps, and
testing. Writing patches doesn't count against it. **S** = under an hour,
**M** = one to two hours, **L** = several sittings. They're guesses; they'll
get better as we go.

**Status:** `done` · `in progress` · `closing` · `next` · `planned` · `sketch`

---

## North star

A site that does two jobs at once, without either one undermining the other:

1. **A front door** that a client or hiring engineer can trust in 90 seconds.
   Fast, honest, accessible, and still unmistakably playful.
2. **A workshop** where anything you learn gets built in: ASCII art, Go
   services, AI features, games, writing, whatever comes next. New wings arrive
   as new folders. They don't require surgery on what already exists.

The tension between the two is managed, not resolved. Experiments live in the
Lab (P5) until they're ready to face visitors.

## Why this order

Seven rules decide the sequence. When the plan changes, it should still obey
them.

1. **People before polish.** Anything that misleads a real visitor — a dead
   link, a wrong time, a false "sent!" — gets fixed before anything cosmetic.
2. **External deadlines pull work forward.** Supabase retires its legacy keys
   by the end of 2026 (ADR 0003). That date is theirs, not ours.
3. **Safety net before surgery.** CI and a clean lint (P2) come before the big
   structural refactor (P3), so the refactor can't quietly break the build.
4. **Foundations before wings.** No articles until content lives in data
   (P3.3). No vault until the security habits are proven on smaller features.
5. **Every step ships.** `master` is production: every push deploys. So no
   step leaves the live site half-built. Unfinished work stays unlinked or
   behind an "unlisted" flag.
6. **Near is detailed, far is sketched.** P1 is planned down to the order of
   dashboard clicks. The vault gets a paragraph. Detailed plans for things we
   don't understand yet are guesses that go stale.
7. **Learning is a deliverable.** Each step names what it teaches.

---

## At a glance

| Phase | Goal | Status | Effort | Exit gate (short) |
|---|---|---|---|---|
| **P0** Groundwork | A workflow and a record that make everything else safe | `closing` | S | Owner items done |
| **P1** Nothing lies to a visitor | Booking and contact keep every promise | `in progress` | L | Correctness + security items resolved; legacy keys off |
| **P2** Honest front door | Site and repo are true, clean, accessible | `planned` | M | CI green; README true; keyboard pass |
| **P3** Platform foundations | A new wing = a new folder | `planned` | L | A throwaway wing added with zero edits elsewhere |
| **P4** Identity & integrations | Your own domain, email, and real meeting links | `planned` | L | Own domain; Gmail password deleted; per-meeting links |
| **P5** The Lab | A home for experiments | `planned` | M | `/lab` live with two experiments |
| **Horizon** | Writing, Courses, Games, Services, AI, Vault | `sketch` | — | Planned when their turn comes |

How the phases depend on each other:

```
  P0 ──► P1 ──┬──────────────────────────────► P4.3 ─ P4.5
 done   now   │   Nothing lies to a visitor     Resend, Calendar API, alerts
              │                                    ▲
              ▼                                    │ needs a domain
              P2 ──► P3 ──► P5 ──► Horizon         │
              Honest  Plat-   The   Writing ·      │
              front   form    Lab   Courses ·      │
              door    found-        Games ·        │
                      ations        Services · AI  │
                                    · Vault (last) │
                                                   │
  P4.1 Domain · P4.2 Email routing ────────────────┘
  owner tasks with no code dependencies: do them whenever you like
```

---

## P0 — Groundwork

**Status:** `closing`

**Goal:** a way of working where every change is reviewed, explained, and
reversible, and where the written record matches reality.

### Done

- Decision log with ADRs (`docs/decisions/`), `CLAUDE.md` as shared context.
- Patch workflow: chat writes → Claude Code applies → you review and commit
  (`docs/runbooks/applying-patches.md`).
- Review bundles, so the chat session sees what actually happened on your
  machine (`docs/runbooks/review-bundles.md`).
- The false leak claim corrected (ADR 0001 erratum). The Supabase key plan
  updated for the 2026 deprecation (ADR 0003).
- This roadmap.

### Remaining — all 👤, none urgent

**P0.1 Fix your git identity** · S · recommended

The repo's history shows six different author names across two email
addresses, and the name field on the latest commit holds an email address.
Every commit in a public repo publishes its author name and email
permanently.

```bash
git config --global user.name  "Your Name"
git config --global user.email "<id>+CosmiCodeArcher@users.noreply.github.com"
```

The noreply address is on GitHub under Settings → Emails, once "Keep my email
addresses private" is on. Commits made with it still link to your profile, but
don't expose a personal inbox. It's the commit-author version of ADR 0002's
point: public identities and private inboxes are different things. Past
commits keep their old identities; rewriting published history isn't worth it.

**P0.2 Turn on GitHub push protection** · S

Repo → Settings → Code security → secret scanning and push protection. It
blocks pushes that contain recognisable credentials. It's free, and it's the
safety net ADR 0001 recommended.

**P0.3 Scheduled rotation of the Gmail app password** · S · optional

The order is in `docs/runbooks/credential-rotation.md`: replace first, then
revoke. It's hygiene, not an emergency. It becomes moot at P4.3, which deletes
the Gmail password entirely.

**P0.4 Make deploy logs private** · S

Netlify site settings → build & deploy → deploy log visibility. They're
public today, and while they show only variable names now, a build that
printed a value would publish it.

**P0.5 Decide on `RESEND_API_KEY`** · S

It's set in Netlify but no code reads it. Either keep it deliberately for
P4.3 (and note that here), or revoke it in Resend and delete it from Netlify.
An unused live credential is risk with no benefit.

**Exit gate:** P0.1, P0.2, P0.4 and P0.5 done (P0.3 at your discretion).

---

## P1 — Nothing lies to a visitor

**Status:** `in progress`
**Deadline inside this phase:** P1.3 before **1 December 2026** (ADR 0003).

**Goal:** every promise the site makes to a visitor is kept. The time is
right, the link works, "sent" means sent, the address they write to is one
you read, and their details stay private.

**Why first:** these harm real people today, and one of them has an external
deadline.

What the site promises, and what actually happens (verified 2026-09-26):

| The site says | What actually happens | Where | Step |
|---|---|---|---|
| "Here's your meeting link" | A random URL that leads nowhere — and a promise that the link arrives "15 minutes before", which nothing sends | `schedule-meeting.js` | P1.1 |
| "Message sent!" | Shown even when the submission failed | `Contact.jsx`, `ContactPage.jsx` | P1.1 |
| "Email me at …" | Three different addresses in three components | `Contact.jsx`, `ContactPage.jsx`, `Footer.jsx` | P1.1 |
| "Your meeting is at 10:00" | The email shows New York time | `schedule-meeting.js` | P1.4 |
| "This slot is free" | Booked slots never grey out for visitors east of UTC, including your own zone (WAT) | `MeetingScheduler.jsx` | P1.4 |
| *(implied)* "Your details are private" | Anyone holding the public key can read every booking | no RLS on `meetings` | P1.3 (hotfix 0008) |
| *(implied)* "Booking works" | "Legacy API keys are disabled": every booking fails, 27 Sep | function and browser on legacy keys | P1.3 (hotfix 0008) |
| *(implied)* "Booking works" | The function crashed on load (HTTP 502) since at least 30 Aug, so every booking failed; and since Netlify began enforcing the module check, no deploy had succeeded | `schedule-meeting.js` | Hotfix 0007 |
| *(implied)* "Booking keeps working" | Supabase pauses free projects after a quiet week | platform policy | P1.5 |

### P1.0 Preview deploys · 👤 · S

**What:** turn on branch deploys in Netlify's site settings (under build &
deploy, "branches and deploy contexts"). A pushed branch then gets its own
preview URL.

**Why:** from P1.2 onward, risky patches go to a branch first, get tested on
the preview, and only then merge to `master` (which is production). Three
limits to know about:

- Previews share the **same database** and, unless you scope them, the same
  environment variables. A test booking on a preview is a real row.
- **Database migrations have no preview.** SQL you run in the Supabase editor
  hits the one real database immediately. That's why P1.3 is ordered so
  carefully.
- Scheduled functions only run on production deploys
  ([Netlify docs](https://docs.netlify.com/build/functions/scheduled-functions/)).

**Done when:** a test branch produces a working preview URL.

**You'll learn:** deploy contexts, and why data changes are the risky part of
any release.

### P1.1 Stop the lies · 👤 + 📦 · S

**Status:** code landed in patch 0006; 👤 step 1 done (room created from the
Meet homepage and set as `MEETING_ROOM_URL`, 2026-09-26). Nothing reached
visitors until hotfix 0007 fixed deploys. Remaining: the done-when checks,
once 0007 shows **Published**.

**What:**

1. 👤 Create a **fallback meeting room**: a Zoom personal room, or a Meet link
   made from the [Meet homepage](https://meet.google.com), not from Calendar.
   The difference matters. Homepage-made codes expire 365 days after last use.
   Calendar-made codes expire after 60 idle days with no future events
   ([Google](https://support.google.com/meet/answer/10710509)). Turn on the
   waiting room, or require host admission. Store the link in Netlify as
   `MEETING_ROOM_URL`.
2. 📦 The function stops inventing URLs. The confirmation email uses
   `MEETING_ROOM_URL`. If it's missing, the email says "I'll send the meeting
   link before we meet" and your copy flags the problem. It fails safe instead
   of failing silently.
3. 📦 The contact form checks the server's response before showing success.
   On failure it shows an error that includes your email address. It also gets
   the `bot-field` honeypot input that `public/form.html` already declares but
   the React forms never render.
4. 📦 Every contact address and social link comes from `src/config/site.js`.
   Three addresses become one.

**Why the room link is an env var but the contact email lives in `site.js`:**
the contact email is meant to be public, so it's display content. The room
link should only reach people who've booked. Anything in `site.js` ships in
the JavaScript bundle, where anyone can read it.

**Done when:**
- [ ] `git grep "Math.random" netlify/` finds nothing
- [ ] A booking email contains the real room link
- [ ] With the network offline in devtools, the contact form shows an error, not the success page
- [ ] `git grep -E "@(gmail|outlook)\.com" src` matches only `src/config/site.js`

**You'll learn:** fail-safe defaults; the difference between configuration,
secrets, and content.

### P1.2 Harden the booking function · 📦 · M

**What:**

- **Move to Netlify's newer Functions API** (`export default` taking a
  `Request` and returning a `Response`, plus `export const config`). Hotfix
  0007 already made the file an ES module, with the old Lambda-style
  `handler` kept to stay minimal. The newer API is what unlocks config-based
  rate limiting.
- **One validated server config.** Reads the ADR 0003 variable names first and
  falls back to the old ones, logging a warning. You can switch Netlify's
  variables whenever it suits you, with no synchronised "flag day".
- **Validate at the trust boundary.** Required fields, maximum lengths, email
  shape. `type` and `duration` must match a known meeting type — today the
  browser sends the duration and the server believes it. The time must be a
  real, future slot.
- **Escape user text before it goes into HTML email.** Today, a name like
  `<a href="https://evil.example">Confirm your booking</a>` arrives in *your*
  branded email template as a working link. That's a phishing kit someone else
  gets to use against you.
- **Upgrade nodemailer.** `npm audit` reports advisories against the current
  version, including SMTP command injection, and user input reaches the
  mailer. The fix is a major-version upgrade, so it's reviewed here rather than
  swept up by `npm audit fix`.
- **Rate limit.** Netlify's code-based rate limiting works on all plans, with 2
  rules per project on the free tier
  ([Netlify docs](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/)).
  Something like 5 requests per IP per minute. Plus a honeypot field on the
  booking form.
- **Fail gracefully.** If Supabase or email is down, the visitor sees "Booking
  is temporarily unavailable — email me at …". Not a raw status code in an
  `alert()`.

**Done when:**

| Test | Expected |
|---|---|
| Malformed JSON | 400 |
| Unknown meeting type, or a duration that doesn't match it | 400 |
| A 1,000-character name | 400 |
| HTML in the name field | Shows as plain text in the email |
| 6th request from one IP inside a minute | 429 |
| Database unreachable | Friendly message, operator alerted |
| Old env var names only | Works, with a deprecation warning in the logs |

**You'll learn:** trust boundaries; output encoding; rate limiting; semantic
versioning and why major upgrades get reviewed; CommonJS vs ES modules.

### P1.3 New keys and a locked table · 👤 + 📦 · M · deadline

**Status:** pulled forward as **hotfix 0008** (2026-09-27): the code still
used the legacy keys, which the owner had disabled earlier, so booking was
down. Procedure:
`docs/runbooks/supabase-key-cutover.md`. The order below is the original
plan; the runbook adapts it to a site that was already broken, which
removes the need for a preview deploy. Two changes from the plan: the
function reads no fallback names (a disabled key is useless as a fallback),
the migration no longer forces RLS (tested: forcing it made the view return
zero rows), and it revokes Supabase's default write grants on the view
before granting read (review 05 found visitors could otherwise move, delete
or invent bookings through it).

**What:** move to Supabase's publishable and secret keys (ADR 0003), and apply
the RLS migration (`supabase/migrations/0001_meetings_rls.sql`). They go
together because both change who can do what in the database.

**The order matters.** Every step is reversible until step 6.

1. 👤 Create a publishable and a secret key in Supabase. Add
   `VITE_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY` to Netlify
   *alongside* the old variables.
2. 📦 Patch: the browser gets its client from `src/lib/supabase.js` (publishable
   key) and reads the `booked_slots` view instead of the `meetings` table. The
   function uses the secret key. `env.js` and `.env.example` are renamed.
3. Deploy to a preview (P1.0), verify a booking end to end, then merge.
4. 👤 Run the RLS migration in the Supabase SQL editor.
5. 👤 Run the devtools test in step 4c of that migration, on the live site.
6. 👤 **Disable the legacy keys.** This is also their rotation.
7. 👤 Remove the old variable names from Netlify.

**Why this order:**
- The browser must stop reading `meetings` *before* RLS locks the table.
  Otherwise every slot suddenly appears free.
- The function must hold the secret key *before* RLS. Otherwise its INSERT
  fails, and bookings break.
- Code changes can be tested on a preview. Database changes can't. So code
  goes first, and the migration runs only once the code is proven.

**Done when:** the verification checklist in ADR 0003 is complete.

**You'll learn:** least privilege; sequencing a migration so each step is
reversible; why database changes are the riskiest part of a deploy.

### P1.4 A correct time model · 📦 + 👤 · L

**What's wrong, concretely.** Verified with real date arithmetic:

```
A visitor in West Africa Time (WAT, UTC+1) picks Monday 5 Oct 2026, 10:00 AM
  browser builds local 10:00     →  sends 2026-10-05T09:00:00.000Z
  function, on a UTC clock       →  stores date 2026-10-05, time 09:00:00
  email, hardcoded New York      →  "Monday, October 5, 2026 at 5:00 AM"

The next WAT visitor opens the calendar:
  isTimeSlotBooked checks date   →  "2026-10-04"   (local midnight, converted
                                                    to UTC, lands on the 4th)
                     and time    →  "10:00:00"
  the stored row says 2026-10-05 09:00:00  →  no match, slot shows as free
  they submit                    →  409 "already booked"

A visitor in Tokyo (UTC+9) sees "10:00 AM"
  = 01:00 UTC = 02:00 WAT        →  the calendar offers you a 2 a.m. meeting
```

There are three separate bugs in there. The slots are defined in the
*visitor's* timezone. The server derives the stored time from its own clock.
And the browser compares against a date shifted by a UTC conversion.

**The model to adopt:** store **instants**, define availability in **your**
zone, display it in **theirs**.

- **Availability is defined once, in your timezone**, in `src/config/`. For
  example: `{ timezone: 'Africa/Lagos', weekdays: Mon–Fri, slots: ['10:00',
  '14:00'] }`. (`Africa/Lagos` is the IANA name for West Africa Time. It
  names a timezone, not where you live, and the site only ever shows "WAT".)
- **The browser converts each slot into the visitor's zone** and labels both:
  "11:00 AM your time (10:00 WAT)". Use a real timezone library or the
  `Intl` API, never hand-written offsets. WAT has no daylight saving time,
  but many visitors' zones do. (`date-fns` is already installed and unused; this
  step decides whether it earns its place.)
- 👤 **Migration 0002.** Adds `starts_at timestamptz`, `duration_minutes`, and
  `visitor_timezone`. Existing rows are backfilled as UTC, because that's the
  clock the server wrote them with — but check a couple of your own past
  bookings by eye before running it. Adds a **unique index on `starts_at`**,
  and re-creates `booked_slots` to expose `starts_at` only (hard rule 5: no
  personal data in public views).
- **The function stores the instant.** Each recipient's email shows their own
  time: the client's zone for them, `Africa/Lagos` for you. Calendar links
  use UTC (the trailing `Z`), so every calendar app converts correctly.
- **A smoke-test runbook**, `docs/runbooks/booking-smoke-test.md`, using
  Chrome devtools to emulate other timezones.

**Why a unique index:** today the function checks whether a slot is free, then
inserts. Two people submitting at the same moment can both pass the check
before either insert lands. That's a *race condition*. A unique index makes
the database itself refuse the second insert. Correctness belongs at the
lowest layer that can enforce it.

**Done when:**
- [ ] Bookings made from emulated Asia/Tokyo, America/New_York, and Africa/Lagos land on the WAT slot they were shown
- [ ] Each confirmation email shows the recipient's local time
- [ ] A booked slot greys out for visitors in every zone
- [ ] Two simultaneous submissions produce exactly one row

**You'll learn:** instants vs wall-clock time; IANA timezones; `timestamptz`;
race conditions, and why constraints beat check-then-insert.

### P1.5 Keep it awake, prove it works · 📦 + 👤 · S

**What:** Supabase pauses free-plan projects after 7 days without enough
database activity, and resuming is a manual click in the dashboard
([Supabase docs](https://supabase.com/docs/guides/platform/free-project-pausing)).
A low-traffic booking page will hit this, and the first person to find out
would be a client.

- 📦 A Netlify **scheduled function** (available on all plans) runs one small,
  real query every day. That keeps the project active.
- 📦 If the query fails, it emails you. You find out before a client does.

**Rejected:** Supabase Pro, which removes pausing but costs money this traffic
doesn't justify. Also rejected: pinging from an outside cron service. That's
one more account to own, when Netlify can already do it.

**Done when:** the daily run shows in Netlify's function logs, and a
deliberately broken query produces an alert email.

**You'll learn:** scheduled jobs; "silence is not success" monitoring.

**P1 exit gate:**
- [ ] Every Correctness and Security item in `CLAUDE.md` Known problems is resolved
- [ ] ADR 0003's verification checklist is complete
- [ ] The P1.4 smoke test passes from three timezones

---

## P2 — Honest front door

**Status:** `planned`

**Goal:** everything a hiring engineer sees in their first 90 seconds, on the
site and in the repo, is true, clean, and accessible.

### P2.1 The repo tells the truth · 📦 · S

**What:** delete `check.md`, a committed AI transcript full of superseded
advice. Rewrite `README.md` as an actual README: what the site is, the stack,
how to run it (`cp .env.example .env`, `npm ci`, `npm run dev`), an
architecture map linking into `docs/`, a link to this roadmap, and an honest
"known gaps" line. It makes no claims the code can't back.

**Why:** the current README claims lazy loading, memoization, and full
keyboard support. None of that exists. An engineer who checks one claim and
finds it false stops trusting the rest.

**Note:** this step has no dependencies. If you're about to send the repo to
someone, do it first. And parts of a README are your voice — expect to edit my
draft.

### P2.2 Lint at zero, enforced by CI · 📦 · S

**What:** fix the remaining lint errors. There were 27 on 2026-09-26; P1.1
cleared the first row, leaving 19:

| Count | Rule | Fix |
|---|---|---|
| ~~8~~ 0 | `no-undef` in `netlify/functions/` | Done in P1.1: a Node-globals block for `netlify/functions/**` in `eslint.config.js` |
| 14 | `react/no-unescaped-entities` (apostrophes in JSX) | Escape them, or use typographic quotes |
| 4 | `react/prop-types` | Decide: add prop-types, or switch the rule off (common in JavaScript React projects). Record the choice. |
| 1 | `no-unused-vars` (`hoveredProject` in `Portfolio.jsx`) | Remove it |

Then add a GitHub Actions workflow that runs `npm ci`, lint, and build on
every push. It's free for public repos. Add a status badge to the README.

**The workflow must also bundle the functions the way Netlify does.** `npm
run build` never touches `netlify/functions/`, which is how a broken function
passed every local check while every deploy failed (hotfix 0007). The check
that caught it runs Netlify's own bundler (`@netlify/zip-it-and-ship-it`,
`nft` mode, with the enforced flags on), plus a one-line
`import()` of each function.

**Why:** "run lint before declaring work complete" means nothing while lint
fails anyway. CI turns "does it build?" into one answer, visible to everyone,
checked on every push, including pushes that skip the patch workflow.

**Done when:** CI is green on `master`, and a deliberately broken push turns it
red.

**You'll learn:** continuous integration; why automated checks beat good
intentions.

### P2.3 Dependency hygiene · 🖥 · S

**What:** remove `@calcom/embed-react`, `dotenv`, and `node-fetch`, confirmed
unimported on 2026-09-26. Remove `date-fns` too, unless P1.4 adopted it. Run
`npm audit fix`. Consider a Dependabot config for grouped weekly updates.

**Why a local task, not a patch:** the lockfile should be regenerated by your
own npm, and a machine-generated diff that size isn't worth reading line by
line. Review the `package.json` diff and the audit output instead.

**Context:** GitHub's "58 vulnerabilities" counts advisories. `npm audit`
counts packages: 25 as of today, 17 rated high. Most are build tools (Vite,
Rollup, PostCSS) that never reach a visitor's browser. The runtime-relevant
ones are `react-router` and `nodemailer`. Everything except nodemailer clears
with `npm audit fix`, without major upgrades. Nodemailer is handled in P1.2.

### P2.4 Accessibility and motion · 📦 · M

**What:**
- `<MotionConfig reducedMotion="user">` at the root. One line, and Framer
  Motion respects the operating system's "reduce motion" setting across the
  whole site.
- The bubbles become real `<button>`s, so a keyboard can reach them.
- Modals trap focus, close on Escape, and return focus to whatever opened them.
- Carousel arrows get labels. Plus a colour-contrast pass.

Record Lighthouse's accessibility score before and after.

**Why:** the site is almost entirely motion. For people with vestibular
disorders, that's a barrier, not a style. And "keyboard accessible" is one of
the README's current false claims. After this step it's true.

**Done when:** you can use the whole site with the keyboard alone, and turning
on reduce-motion in your OS visibly calms it.

### P2.5 Content that's actually there · 👤 + 📦 · S

**What:**
- **Behind the Work** still references the two photos removed in `8fc2731`,
  so visitors see broken images. 👤 Decide: (a) a private Supabase bucket with
  signed URLs, as sketched in the component's own comments; (b) different
  photos; or (c) hide the section until it's ready.
- **A short privacy note** on the booking page: what's stored, why, for how
  long, and how to ask for deletion. 👤 Decide on retention, for example
  deleting bookings older than 12 months. P1.5's scheduled function can
  enforce it.

**P2 exit gate:**
- [ ] CI green on `master`
- [ ] README makes no false claims
- [ ] Keyboard-only pass through the whole site
- [ ] No known-broken UI

---

## P3 — Platform foundations

**Status:** `planned`

**Goal:** adding a wing means adding a folder. Nothing existing changes.

### P3.1 Routing shell · 📦 · M

**What:** a layout route with `<Outlet />`, so every page shares the nav and
footer. An `errorElement`, so a thrown error shows a friendly page instead of
a white screen. A 404 route, scroll restoration, and per-page titles.

**Decision to record in an ADR:** the home sections (Portfolio, About,
Contact) become real URLs — `/portfolio` and so on. Today they're state inside
`Hero.jsx`, so nothing can be linked to, bookmarked, or reached with the back
button. The transitions stay: Framer Motion's `AnimatePresence` can key on the
route instead of on state.

### P3.2 Feature folders · 📦 · M

**What:** move from a flat `src/` to this:

```
src/
├── app/            router, providers, layout shell, error and 404 pages
├── features/
│   ├── home/       Hero, BrandBubbles
│   ├── portfolio/
│   ├── about/      including Behind the Work
│   ├── contact/    one ContactForm, replacing Contact.jsx + ContactPage.jsx
│   └── booking/    MeetingScheduler and its slot and time logic
├── components/     shared building blocks: Modal, Carousel, Button
├── content/        projects, skills, journey  (P3.3)
├── config/         site.js  (exists)
├── lib/            env.js, supabase.js  (exist)
└── styles/
```

Only moves and import updates. Behaviour doesn't change, except that the two
forked contact components merge into one. Git records the moves as renames, so
`git log --follow <file>` still shows each file's full history.

### P3.3 Content as data · 📦 · M

**What:** `projects` (now inside `Portfolio.jsx`) and `skills` and `journey`
(inside `About.jsx`) move to `src/content/`, with their shape documented.
Components render whatever they're given. Adding a project means adding one
entry to one data file.

**Decision to record:** plain JavaScript or JSON modules in the repo for now.
They're versioned, reviewed in diffs, and cost nothing at runtime. MDX arrives
with Writing. A database only for content that must change without a deploy,
and nothing needs that yet.

### P3.4 Load only what's needed · 📦 · S

**What:** `React.lazy` per route. Today the site ships a single 627 kB
JavaScript bundle (185 kB gzipped). Every visitor downloads the booking system
just to see the home page. Measure before and after. The target is roughly
halving what the home page loads, but it's the measurement that counts.

### P3.5 Theme foundation · 📦 · M

**What:**
- A theme provider at the root.
- A tiny inline script in `index.html` that sets the dark-mode class *before*
  React loads, so there's no flash of the wrong theme.
- Theme stored separately from navigation state. Today they share one
  localStorage blob.
- Colours, fonts, and corner radii as CSS variables feeding Tailwind. A "skin"
  then becomes nothing more than a different set of variables.

**Why:** this is what makes the ASCII skin (P5) a swap, not a rewrite.

### P3.6 Links that look good when shared · 📦 · S

**What:** per-page meta descriptions; an Open Graph image, so links pasted
into LinkedIn, WhatsApp, or X show a proper preview card; a sitemap and
`robots.txt`.

**P3 exit gate:** a throwaway wing (`/hello`) gets added by creating one
folder and registering one route, with zero edits to any other feature. That
wing then becomes the seed of the Lab.

---

## P4 — Professional identity and integrations

**Status:** `planned`. P4.1 and P4.2 can happen any time.

### P4.1 Your own domain · 👤 + 📦 · S · any time

**What:**
- 👤 Register a name-based domain. ADR 0002 suggests `awodi.dev`; check it's
  available. Registering through Cloudflare keeps DNS on Cloudflare, which
  P4.2's free email routing needs. `.dev` domains are HTTPS-only, which
  Netlify handles automatically.
- 👤 Point it at Netlify. Keep `cc-archer.netlify.app` redirecting to it.
- 📦 Replace the hardcoded `https://cc-archer.netlify.app/…` URLs (six in the
  function's email templates, four in components). Components get relative
  paths. Emails, which need absolute URLs, get a `SITE_URL` setting.

### P4.2 Email on your domain · 👤 + 📦 · S · after P4.1

**What:** Cloudflare Email Routing forwards `hello@<domain>` to `gackmar@`
for free. Gmail's "Send mail as" lets you reply from it. 📦 Then change
`contactEmail` in `site.js`: one line, which is the whole payoff of ADR 0002.

### P4.3 Transactional email from your domain · 👤 + 📦 · M · needs P1.2 + P4.1

**What:** switch the booking emails from Gmail SMTP to
[Resend](https://resend.com/pricing). The free tier is 3,000 emails a month,
100 a day. Verify your domain with the SPF and DKIM DNS records Resend
provides, then send from `bookings@<domain>`. Check deliverability with a tool
like mail-tester.

**Why:** booking confirmations from a personal Gmail over SMTP tend to land in
spam (ADR 0002). And the Gmail app password, the most dangerous credential in
the project, gets **deleted**, not just rotated.

### P4.4 A real link for every meeting · 👤 + 📦 · L · needs P1.2 + P1.1

**What:** the layered design agreed on 2026-09-26:

```
booking ──► create a Google Calendar event with a Meet link
               │
               ├── works ──► email that link, plus a calendar invite to the client
               │
               └── fails ──► email the fallback room (P1.1)
                             └──► alert you: "fallback used — check the integration"
```

The client always gets a working link. Failures reach you instead of hiding.

**Pitfalls, written down before we hit them:**
- OAuth apps left in **Testing** status get refresh tokens that expire after 7
  days ([Google](https://support.google.com/cloud/answer/15549945)). The
  integration works on day one and silently dies on day eight. So the app gets
  published **In production**. You're the only person who ever authorises it,
  so the "unverified app" warning shows once, to you, and the 100-user cap for
  unverified apps doesn't matter.
- Service accounts generally can't act on a personal Gmail calendar without
  Workspace domain-wide delegation, so this uses OAuth with your own account.
  Re-check that when we build it.
- Minimal scope (calendar events only). The refresh token is stored as a
  Netlify secret variable.

### P4.5 Know when it breaks · 📦 + 👤 · S

**What:** an alert email on any function failure, generalising what P1.5 does
for the database. A free uptime monitor on the home and booking pages. Error
tracking only if it proves needed, decided in an ADR at the time.

**P4 exit gate:**
- [ ] The site runs on your domain
- [ ] Your public email is on your domain
- [ ] Booking emails pass SPF and DKIM
- [ ] The Gmail app password is deleted
- [ ] Per-meeting links are live, with the fallback tested

---

## P5 — The Lab

**Status:** `planned`

**Goal:** a home for experiments, so that "everything I learn goes into the
site" never clutters the front door.

**Shape:**

```
src/features/lab/
├── manifest.js         one entry per experiment: slug, title, date, tags,
│                       status (live | unlisted), a "what I learned" note
├── LabIndex.jsx        /lab: renders the manifest
└── experiments/
    ├── ascii-banner/   /lab/ascii-banner: lazy-loaded, self-contained
    └── <next-thing>/
```

- **`unlisted`** experiments are reachable by URL but not listed on `/lab`. So
  you can ship work in progress continuously without showing anything
  half-done (rule 5).
- **Each "what I learned" note is a small article.** The good ones graduate
  into Writing later.

**Seed experiments, from work you've already done:**

1. **ASCII banner renderer: your 01-edu Go code, running in the site.** Two
   ways to do it:
   - **Compile it to WebAssembly.** Your Go renderer runs, unmodified, in the
     visitor's browser, updating live as they type. Standard Go WebAssembly
     output is large. TinyGo produces much smaller files. That's a trade-off to
     measure, not guess.
   - **Deploy it as a Go Netlify Function.** Go is supported through the
     Lambda-compatible API
     ([Netlify docs](https://docs.netlify.com/build/functions/get-started/)).
     It's essentially your ascii-art-web, made serverless.

   **Recommendation:** WebAssembly first. "My Go code, running in your
   browser" is a striking portfolio piece. The function version is a good
   first step toward the Services wing.
2. **An ASCII skin:** a theme built on P3.5's variables, with banner-font
   headings, a monospace grid, and box-drawing dividers. Two rules: the art is
   `aria-hidden`, with a real text alternative, so screen readers get words,
   not noise; and below roughly 380 px wide it falls back to plain text,
   because monospace art breaks on small phones.

**Exit gate:** `/lab` is live with two experiments, and adding a third touches
only its own folder plus one manifest line.

---

## Horizon

**Sketched on purpose.** Each wing gets planned in detail when its turn
comes, with whatever we've learned by then.

| Wing | What | Needs first | Biggest risk | Decide when we get there |
|---|---|---|---|---|
| **Writing** | Articles in MDX, tags, RSS, a share image per post | P3.3, P3.6 | Building writing infrastructure instead of writing | MDX in the repo vs a headless CMS |
| **Courses** | Multi-lesson content with progress | Writing's pipeline | Scope explosion | Progress in localStorage vs real accounts |
| **Games** | Canvas or WebGL toys, each its own lazy bundle | P3.4 | Bloating the front door | An engine, or hand-rolled |
| **Services** | Your Go and Python backend work, as real APIs | P1.2's patterns | Hosting sprawl | Netlify Go functions vs a separate host. Netlify Functions don't run Python. |
| **AI** | For example, "ask my portfolio", grounded in your own content | P1.2 rate limiting, P3.3 content | Cost and abuse | Provider, spending caps, what data it may see |
| **Vault** | Private storage for you alone | All of P1, plus a threat-model ADR | Real harm if it's wrong | Auth model, encryption, what never goes in |

**The Vault is built last, deliberately.** It's the one wing where a mistake
costs more than embarrassment. Before any code, an ADR answers four questions:
what goes in, what must never go in, who can access it, and what an attacker
gets if the Supabase project is compromised. The likely shape is Supabase Auth
with you as the only user, per-user RLS, private storage buckets with
short-lived signed URLs (the same pattern already sketched in
`BehindTheWork.jsx`), and client-side encryption for anything truly sensitive,
so that even a database leak only reveals scrambled data.

---

## Ideas inbox

**Capture anything, commit to nothing.** New ideas get a dated line here.
Nothing moves from the inbox into a phase except at a planning review (see
below). That keeps a limitless project from becoming a never-finished one.

| Date | Idea | From | Placed |
|---|---|---|---|
| 2026-08-30 | ASCII-art aesthetics | Owner | P5 |
| 2026-08-30 | Articles | Owner | Horizon: Writing |
| 2026-08-30 | Games | Owner | Horizon: Games |
| 2026-08-30 | Courses | Owner | Horizon: Courses |
| 2026-08-30 | A vault for private things | Owner | Horizon: Vault |
| 2026-09-26 | A "build log" page generated from `docs/decisions/`, so the site shows its own engineering | Claude (suggestion) | — |
| 2026-09-26 | A guestbook: a small, low-stakes way to practise auth and RLS before the vault | Claude (suggestion) | — |

---

## Working the roadmap

**Starting a step.** Check the step's "needs" and the previous phase's exit
gate. If a step turns out bigger than written, split it rather than stretching
it.

**Definition of done**, for every step:
- [ ] Lint: no new errors (zero, once P2.2 lands)
- [ ] Build passes (CI green, once P2.2 lands)
- [ ] `CLAUDE.md` Known problems updated
- [ ] This file's status updated **in the same commit**
- [ ] An ADR, if the step made an architectural choice
- [ ] A review bundle written (`docs/runbooks/review-bundles.md`)
- [ ] For anything a visitor touches: you tried it yourself

**Naming.** Always say the noun: "phase P1", "step P1.3", "ADR 0003",
"patch 0006". Patches are numbered in a single sequence across the whole
project, so a patch number never collides with a phase or ADR number in
conversation.

**Planning review**, at every phase exit, about ten minutes: tick the exit
gate, update the Horizon, triage the inbox, and reorder if priorities have
changed.

**Changing the plan is expected.** Record the change and the reason below.

---

## Change log

| Date | Change | Why |
|---|---|---|
| 2026-09-27 | Hotfix 0008: P1.3 pulled forward | The first real test booking returned "Legacy API keys are disabled" (the owner had disabled them earlier). Browser and function moved to publishable/secret keys. Migration 0001 fixed twice before it ever ran: FORCE dropped (it would have emptied the view), and a revoke added (review 05: Supabase's default grants made the view writable by the public). Both proven on real Postgres with Supabase-style roles and default privileges |
| 2026-09-26 | Hotfix 0007: function converted to ES modules | Every deploy had failed since Netlify began enforcing its CommonJS-under-`"type": "module"` check, and the live function crashed with a 502. Found by review bundle 03. Added P0.4, P0.5, and a Netlify bundle check to P2.2's CI |
| 2026-09-26 | P1 in progress; P1.1 code landed (patch 0006) | Also: pulled P2.2's ESLint Node block forward (lint 27 → 19); city name replaced with the WAT timezone label in docs, since `Africa/Lagos` names a zone, not an address |
| 2026-09-26 | Roadmap created (patch 0005) | Gives every patch a place in a plan. P1 ordered around the Supabase key deadline (ADR 0003) and the deeper timezone bug found while surveying the code. |
