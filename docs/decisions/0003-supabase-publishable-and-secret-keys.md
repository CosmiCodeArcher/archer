# 0003 — Adopt Supabase publishable and secret keys

**Status:** Accepted — amends [0001](0001-secrets-out-of-version-control.md)
(key names only; its principles stand). **Cut over in hotfix 0008
(2026-09-27)**, ahead of plan: the owner had already disabled the legacy keys,
and the code still used them, so booking was down. Verification: see
`docs/runbooks/supabase-key-cutover.md`.
**Date:** 2026-09-26
**Deadline:** cut over before **1 December 2026** (see Context)

## Context

Supabase has two generations of API keys:

| Generation | Browser key | Server key | Format |
|---|---|---|---|
| Legacy | `anon` | `service_role` | Long-lived JWTs derived from the project's JWT secret |
| Current | publishable (`sb_publishable_…`) | secret (`sb_secret_…`) | Short random strings, managed individually |

Supabase is **deprecating the legacy `anon` and `service_role` keys by the end
of 2026** ([migration guide](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)).
The docs give no finer schedule for what stops working when, so the only safe
reading is "finish well before December."

This project is entirely on legacy keys, in two places:

- **Browser:** `MeetingScheduler.jsx` creates its own client with
  `VITE_SUPABASE_ANON_KEY`.
- **Netlify function:** `schedule-meeting.js` also uses the **anon** key
  (`SUPABASE_ANON_KEY`). That's the wrong role for server code — which is why
  migration `0001_meetings_rls.sql` would break its INSERT.

ADR 0001 planned to fix the function by giving it the `service_role` key. That
plan would have moved us onto a key type with about three months left to live.

## Decision

1. **Browser → publishable key.** Env var `VITE_SUPABASE_PUBLISHABLE_KEY`
   replaces `VITE_SUPABASE_ANON_KEY`. The browser gets its client from
   `src/lib/supabase.js` only.
2. **Netlify function → secret key.** Env var `SUPABASE_SECRET_KEY` replaces
   both `SUPABASE_ANON_KEY` (what's deployed today) and
   `SUPABASE_SERVICE_ROLE_KEY` (what ADR 0001 planned but was never deployed).
3. **After the cutover is verified, disable the legacy keys** in the Supabase
   dashboard. This doubles as the rotation of the Supabase credentials that
   left the machine in a shared copy of the project (ADR 0001 erratum). No JWT
   secret rotation is needed.
4. The cutover happens in roadmap step **P1.3**, together with the RLS
   migration, because both change who can do what in the database.

| Role | Legacy name (today) | Target name |
|---|---|---|
| Browser key | `VITE_SUPABASE_ANON_KEY` | `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Function key | `SUPABASE_ANON_KEY` | `SUPABASE_SECRET_KEY` |
| Planned, never deployed | `SUPABASE_SERVICE_ROLE_KEY` | *(superseded — use `SUPABASE_SECRET_KEY`)* |

## Reasoning

**The deadline decides it.** Everything else below is a bonus.

**Nothing about the security model changes.** The publishable key maps to the
same `anon` Postgres role the anon key did, and the secret key to the same
`service_role` role. So everything in ADR 0001 still holds: the browser key is
public by design, Row Level Security is the real boundary, and the server key
bypasses RLS and must never reach the browser. Migration `0001_meetings_rls.sql`
needs no changes, because it's written against Postgres roles, not key strings.

**Rotation gets much cheaper.** A legacy key can only be invalidated by rotating
the project's JWT secret, which kills *every* legacy key and signs out every
user at once. Secret keys are created and deleted individually. Rotation
becomes: create a new key, swap it in Netlify, redeploy, delete the old one.
No outage, no collateral damage. That matters most later, when the vault
exists and a global sign-out would be disruptive.

**Mistakes fail loudly.** A secret key sent from a browser is rejected with
HTTP 401 — Supabase matches on the `User-Agent` header. So if someone ever
accidentally puts it behind a `VITE_` prefix, the site breaks immediately
rather than quietly handing every visitor full database access. That's
*defence in depth*: a second safeguard behind the rule, for the day the rule
gets forgotten.

**Rejected: stay on legacy keys until forced.** It saves a few hours now and
turns a calm migration into an emergency later, on Supabase's schedule instead
of ours.

**Rejected: finish ADR 0001's plan first (anon → service_role), then migrate.**
That's two cutovers of the same credential where one will do.

## Consequences

**Costs:**
- Env var renames in Netlify, `.env.example`, `src/lib/env.js`, and the
  function. The P1.2 function-hardening patch reads the new names first and
  falls back to the old ones, so Netlify can be switched without a
  synchronised "flag day".
- **The new keys must travel in the `apikey` header, not
  `Authorization: Bearer`.** Sent as a bearer token, they're validated as a JWT
  and rejected with `Invalid JWT`. `supabase-js` handles this itself. Any
  hand-written `fetch` to Supabase must set the header explicitly.
- Docs that say "service role key" now mean "secret key". `CLAUDE.md` is
  updated in the same patch as this record. The comments in
  `0001_meetings_rls.sql` refer to the Postgres `service_role` *role*, which
  still exists, so they stay accurate.

**Enables:**
- Per-environment keys later (for example a separate secret key for a future
  Go service) that can be revoked without touching anything else.
- A rotation story simple enough to actually do on a schedule.

## Verification (at cutover, P1.3)

- [ ] Booking page loads booked slots with the publishable key
- [ ] Function inserts a booking with the secret key
- [ ] Devtools test from `0001_meetings_rls.sql` step 4c: anonymous read of
      `meetings` returns nothing
- [ ] Legacy keys disabled in the dashboard, and the site still works after a
      fresh deploy
- [ ] Old env var names removed from Netlify
