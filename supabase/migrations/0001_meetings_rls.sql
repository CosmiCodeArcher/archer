-- ═══════════════════════════════════════════════════════════════════════════
-- 0001 — Row Level Security for the `meetings` table
--
-- Run in: Supabase dashboard → SQL Editor → New query → Run
--
-- THE PROBLEM THIS SOLVES
-- ───────────────────────
-- The browser previously ran, with the public anon key:
--
--     supabase.from('meetings').select('date, time')
--
-- The column list in that call is a REQUEST, not a restriction. It is sent
-- from the browser and can be edited in devtools. Any visitor could open the
-- console and run:
--
--     supabase.from('meetings').select('*')
--
-- and receive every booker's name, email address, and private notes. If no
-- RLS policy existed, they could also INSERT fake bookings or DELETE real
-- ones.
--
-- The security boundary is never in client code. It is in the database.
--
-- THE FIX
-- ───────
-- 1. Enable RLS on `meetings` and add no permissive policy, so the anon role
--    can do nothing with the table directly.
-- 2. Expose a narrow view containing only the two non-sensitive columns the
--    calendar UI actually needs, and grant read on that.
-- 3. Writes go exclusively through the Netlify function using the Supabase
--    secret key (ADR 0003), which acts as service_role and bypasses RLS by
--    design.
--
-- This is the principle of least privilege: each actor gets exactly the access
-- its job requires and nothing more.
--
-- See docs/decisions/0001-secrets-out-of-version-control.md
-- ═══════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────
-- Step 1 — Enable RLS
--
-- Once enabled, ALL access is denied unless a policy explicitly allows it.
-- Deny-by-default. We are deliberately writing no policies for `anon`, which
-- means anon can do nothing here at all.
--
-- The `service_role` Postgres role bypasses RLS entirely and is unaffected
-- by this. Both the legacy service_role key and its successor, the Supabase
-- secret key (ADR 0003), act as that role. That is why neither key may ever
-- reach the browser.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.meetings enable row level security;

-- Deliberately NOT forced. An earlier draft of this migration (never applied)
-- also ran `force row level security`, which makes RLS apply to the table's
-- OWNER too. But the booked_slots view below reads this table with its
-- owner's privileges (that's how it lets anon see dates and times without
-- touching the table). Forced RLS with no policies would have made the view
-- return zero rows: every slot would look free. Caught in review before
-- anyone ran it (hotfix 0008).
--
-- The owner is `postgres`, which only you use, from the dashboard. Forcing
-- RLS on it would protect against nobody. The statement below is a no-op on a
-- table that was never forced, and undoes it on one that was.
alter table public.meetings no force row level security;


-- ───────────────────────────────────────────────────────────────────────────
-- Step 2 — Revoke direct table access from public roles
--
-- Supabase grants broad table permissions to `anon` and `authenticated` by
-- default so that new projects "just work". Convenient, and exactly how data
-- gets exposed. Revoke explicitly rather than trusting the default.
-- ───────────────────────────────────────────────────────────────────────────
revoke all on public.meetings from anon;
revoke all on public.meetings from authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- Step 3 — A narrow view for the calendar UI
--
-- The booking page needs to grey out taken slots, so it needs to know WHICH
-- times are taken. It does not need to know WHO booked them.
--
-- Exposing only (date, time) means a scraper learns your calendar is busy on
-- Tuesday at 3pm. That is not sensitive — it is the same thing any booking
-- system reveals by showing a slot as unavailable.
--
-- On `security_invoker = false` (the default, stated here explicitly):
-- the view executes with the permissions of its OWNER, not the caller. That
-- is what lets it read the locked-down base table on behalf of anon. If it
-- were `true`, the view would run as anon, hit the revoke above, and return
-- nothing. Being explicit avoids a confusing empty-result bug if Postgres
-- defaults ever change.
-- ───────────────────────────────────────────────────────────────────────────
drop view if exists public.booked_slots;

create view public.booked_slots
with (security_invoker = false) as
  select
    date,
    time
  from public.meetings;

comment on view public.booked_slots is
  'Public read-only projection of meetings exposing only date and time. '
  'The base table is RLS-locked and unreadable by anon. Do NOT add columns '
  'here without confirming they contain no personal data.';

-- Take away everything first, THEN grant SELECT.
--
-- Supabase gives anon and authenticated ALL privileges on every new table
-- AND view in `public` by default. A plain view over one table is also
-- automatically updatable in Postgres: an UPDATE, DELETE or INSERT on the
-- view is carried out on `meetings`. And because this view runs with its
-- owner's rights, RLS on `meetings` doesn't stop it. Without this revoke,
-- anyone holding the public key could move, delete or invent bookings
-- through the view. Found in review 05, before this migration was ever run.
revoke all on public.booked_slots from anon, authenticated;
grant select on public.booked_slots to anon;
grant select on public.booked_slots to authenticated;


-- ───────────────────────────────────────────────────────────────────────────
-- Step 4 — Verify
--
-- Run these after applying. Do not skip this. A security control you have not
-- tested is a security control you are guessing about.
-- ───────────────────────────────────────────────────────────────────────────

-- 4a. Confirm RLS is on:
--
--     select relname, relrowsecurity, relforcerowsecurity
--     from pg_class
--     where relname = 'meetings';
--
--     Expect: relrowsecurity = true, relforcerowsecurity = false

-- 4b. Confirm no policies grant anon access:
--
--     select policyname, roles, cmd
--     from pg_policies
--     where tablename = 'meetings';
--
--     Expect: zero rows.

-- 4c. The real test: ask the API exactly what an anonymous visitor can get.
--     Open any browser tab, press F12, go to Console, and paste the lines
--     below, filling in your project URL and your PUBLISHABLE key. The
--     publishable key is public by design, so pasting it into your own
--     browser is fine. Never do this with the secret key.
--
--     const base = 'https://<your-project>.supabase.co/rest/v1/';
--     const h = { apikey: '<your sb_publishable_ key>' };
--     await (await fetch(base + 'meetings?select=*', { headers: h })).json();
--
--     Expect: an error object mentioning "permission denied for table
--     meetings". If you see names or email addresses, the migration did not
--     apply. Stop and fix it.
--
--     await (await fetch(base + 'booked_slots?select=*', { headers: h })).json();
--
--     Expect: an array of { date, time } objects, and nothing else. An empty
--     array [] is correct if there are no bookings yet.
--
-- 4d. Confirm the public can only READ the view (the check that would have
--     caught the write hole, review 05):
--
--     select grantee, string_agg(privilege_type, ', ') as privileges
--     from information_schema.role_table_grants
--     where table_name = 'booked_slots' and grantee in ('anon', 'authenticated')
--     group by grantee;
--
--     Expect exactly two rows: anon | SELECT, and authenticated | SELECT.
--     Anything more (UPDATE, DELETE, INSERT …) means visitors can change
--     bookings. Stop and fix it.
--
-- 4e. Supabase's Security Advisor will list booked_slots as a "security
--     definer view". That's expected: it's the whole design, since the view
--     reads the locked table on anon's behalf. It's safe because the view
--     exposes only date and time (CLAUDE.md hard rule 5).


-- ═══════════════════════════════════════════════════════════════════════════
-- FOLLOW-UP (not in this migration — kept separate on purpose)
--
-- Migrations should do one thing. Bundling unrelated changes makes them
-- harder to review and impossible to roll back independently.
--
-- Still outstanding:
--
--   • Done in hotfix 0008: the Netlify function uses SUPABASE_SECRET_KEY
--     (the service_role successor, ADR 0003), which bypasses RLS, and the
--     browser reads booked_slots instead of meetings.
--
--   • Migration 0002 will replace the separate `date` + `time` columns with
--     a single `timestamptz`, to fix the timezone bug where confirmation
--     emails are formatted in a hardcoded America/New_York.
--
--   • Consider a unique constraint on the slot to prevent double-booking at
--     the database level. The current check-then-insert in the function has a
--     race condition: two people submitting simultaneously can both pass the
--     check before either writes. A unique index makes the database reject
--     the second one. Correctness belongs at the lowest layer that can
--     enforce it.
-- ═══════════════════════════════════════════════════════════════════════════
