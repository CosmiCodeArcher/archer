# Runbook — Supabase key cutover and table lockdown

**Use when:** applying hotfix 0008 (roadmap step P1.3, pulled forward on
2026-09-27 because the project's legacy keys, which the owner had disabled
earlier, were still what the site used).
**Time:** about 20 minutes.
**Related:** [ADR 0003](../decisions/0003-supabase-publishable-and-secret-keys.md),
`supabase/migrations/0001_meetings_rls.sql`

> **Values never leave the dashboards.** Copy each key straight from Supabase
> into Netlify. Don't paste one into a chat, a file, or a commit. The
> publishable key is public by design, so step 5 pastes it into your own
> browser's console, but even that one stays out of chats and the repo.

## Why the order matters

Two facts decide it:

- **Vite bakes `VITE_` variables into the JavaScript at build time.** The
  browser only sees the new publishable key if it's in Netlify *before* the
  deploy that builds the site. Set it after, and the site ships without it.
- **The live site is already broken** (legacy keys disabled), so running the
  migration early can't break anything that currently works. Running it
  *before* the new code deploys means the `booked_slots` view is waiting
  when the new browser code asks for it.

## Steps

### 1. Get the keys (Supabase)

Dashboard → your project → Project Settings → API Keys.

1. **Publishable key.** If one is listed (`sb_publishable_…`), use it.
   Otherwise create one.
2. **Secret key.** Create a new one and name it `netlify_functions`
   (Supabase key names can't contain hyphens). Naming says where it's used,
   so revoking it later is obvious.

The legacy keys stay disabled. You turned them off earlier, and nothing will
need them after this.

### 2. Put them in Netlify

Site configuration → Environment variables → add:

| Variable | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_PUBLISHABLE_KEY` | the `sb_publishable_…` key | Goes into the browser bundle. That's fine: it's public by design |
| `SUPABASE_SECRET_KEY` | the `sb_secret_…` key | **Never** give this a `VITE_` prefix |

Keep `SUPABASE_URL` and `VITE_SUPABASE_URL` as they are. The function reads
the first, the browser the second. Leave the old `VITE_SUPABASE_ANON_KEY` and
`SUPABASE_ANON_KEY` for now; step 6 removes them.

On the free plan, variables apply to every scope. That's safe for
`SUPABASE_SECRET_KEY`: without the `VITE_` prefix, the build can read it but
never ships it.

### 3. Run the migration (Supabase)

After Claude Code has applied the patch (it stops before committing), open
`supabase/migrations/0001_meetings_rls.sql` in the repo, copy the whole file,
and run it in Supabase → SQL Editor → New query.

The `drop view if exists` line may show a notice on the first run. That's
normal. Then run checks **4a**, **4b** and **4d** from the bottom of the file,
in the same editor. **4d is the important one:** it must show only `SELECT`
for both roles. That's the check for the write hole found in review 05.

> If the SQL editor reports an error such as "column date does not exist",
> stop. The real table differs from what the code assumes. Record the error
> in the bundle and don't push.

### 4. Commit and push (Claude Code)

Approve the commit, push, and wait for the deploy to show **Published**.
Because step 2 happened first, this build includes the publishable key.

### 5. Verify

1. **Migration check 4c** (in the migration file): with the publishable key,
   `meetings` must return "permission denied", and `booked_slots` must return
   only `{ date, time }` objects.
2. **A real test booking.** It should succeed, and both emails should arrive,
   the client's with your meeting room link.
3. **Supabase → Table Editor → `meetings`**: the test row exists. Delete it.

### 6. Clean up (Netlify)

Delete `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`. Nothing reads them
any more, and a disabled key that's still configured misleads the next
person who reads the settings.

Then trigger one more deploy and repeat 5.2, to prove nothing still depended
on them.

## If it goes wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| Booking returns 503 "temporarily unavailable" | `SUPABASE_SECRET_KEY` or `SUPABASE_URL` missing in Netlify | Check the function log for the `[config]` line naming the variable, set it, redeploy |
| Booking still says "Legacy API keys are disabled" | The new code isn't deployed yet | Check the deploy is Published, then hard-refresh the page |
| Console error loading booked slots | The view doesn't exist yet, or the publishable key is missing from the build | Run step 3; if the key was added after the deploy, redeploy |
| `booked_slots` returns `[]` while bookings exist | The table was forced (old migration draft) | Rerun the current migration: it undoes that |
| Check 4d lists more than `SELECT` | The migration ran without its `revoke all` line (an old copy?) | Rerun the current file; it's safe to run again |
