# 0001 — Secrets out of version control

**Status:** Accepted
**Date:** 2026-08-30

## Context

`.env` was committed to the repository and `.gitignore` did not list it. The
file contained a Gmail app password, a Supabase project URL, and a Supabase
anon key, all live.

Two separate problems were tangled together here, and it's worth pulling them
apart because they have different fixes:

**Problem A — the app password.** This is a true secret. It grants the ability
to send mail as the account holder. Anyone who read the repo could impersonate
the owner by email. There is no configuration that makes leaking this
acceptable.

**Problem B — the Supabase anon key.** This one is more subtle, and the subtlety
is worth understanding because it's a common source of confusion.

The anon key is *designed* to be public. It ships inside the browser bundle by
necessity — that's what the `VITE_` prefix means in Vite: "inline this value
into client-side code at build time." Anyone can open devtools on the deployed
site and read it. Hiding it in `.env` was never providing security.

What actually protects a Supabase database is **Row Level Security (RLS)**.
The anon key says "I am an anonymous visitor." RLS policies say what an
anonymous visitor is allowed to do. If RLS is off or permissive, the anon key
is a skeleton key. If RLS is correct, the anon key is harmless in public.

So the anon key is not the vulnerability. The vulnerability is whatever RLS
policy sits behind it. That's addressed separately in
`supabase/migrations/0001_meetings_rls.sql`.

## Decision

1. `.env` is removed from git tracking and added to `.gitignore`.
2. `.env.example` is committed in its place, listing every variable name with
   no values, so the required configuration is documented without leaking it.
3. All leaked credentials are treated as permanently compromised and rotated.
   See `docs/runbooks/credential-rotation.md`.
4. Environment access moves behind `src/lib/env.js`, which validates on import
   and fails loudly rather than silently passing `undefined` into a client
   constructor.
5. Server-side secrets live in the Netlify dashboard, never in a file.

## Reasoning

**Why rotation and not just history rewriting.** `git rm --cached .env` removes
the file from the current commit but the value remains in every prior commit
object, in every clone anyone ever made, and possibly in GitHub's cached views
and any fork. Rewriting history with `git filter-repo` helps, but you cannot
un-ring a bell that other people may already have heard. Rotation invalidates
the secret itself, which is the only fix that doesn't depend on knowing who saw
it. History rewriting is still worth doing afterward, as hygiene, but it is the
second step, not the first.

**Why `.env.example` and not just documentation in the README.** The example
file sits directly beside the real one. When you add a variable, the diff for
`.env.example` shows up in the same commit as the code that uses it, so it
stays in sync. Documentation in a README drifts within weeks.

**Why validate env vars at import time.** Currently `MeetingScheduler.jsx` does
`createClient(import.meta.env.VITE_SUPABASE_URL, ...)` inline. If the variable
is missing in a deploy, `createClient(undefined, undefined)` doesn't throw
immediately. It fails later, deep inside a network call, with an error message
that has nothing to do with the actual cause. Validating at module load turns a
confusing runtime mystery into a clear startup failure. This is a general
principle worth internalising: **fail at the earliest point where the problem is
detectable, not at the point where it becomes visible.**

**Why the Netlify function should stop using the anon key.** Server-side code
has no reason to authenticate as an anonymous browser visitor. It should use
the **service role key**, which bypasses RLS. Once the function holds the
service role key, the anon key needs almost no database permissions at all,
which shrinks what a leak of it could ever do. The service role key is a true
secret and must never be prefixed `VITE_`, or Vite would inline it into the
public bundle — which would be a far worse leak than the original one.

## Consequences

**Costs:**
- A local `.env` must now be created by hand after cloning. Mitigated by
  `.env.example`.
- Two places to update when adding a variable: `.env.example` and the Netlify
  dashboard.
- Git history rewriting, if done, changes every commit hash. Anyone with an
  existing clone must re-clone.

**Enables:**
- Safe public repository, which matters because this repo is itself part of
  the portfolio.
- A clear path to the "vault" feature later. A private-data feature cannot be
  built on top of a project with sloppy credential habits; this establishes the
  habits first.

## Follow-up

- [ ] Rotate all leaked credentials (runbook)
- [ ] Apply RLS migration
- [ ] Switch Netlify function from anon key to service role key
- [ ] Consider `git filter-repo` to scrub history
- [ ] Enable GitHub secret scanning push protection on the repo
