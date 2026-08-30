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
-- 3. Writes go exclusively through the Netlify function using the service role
--    key, which bypasses RLS by design.
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
-- The `service_role` key bypasses RLS entirely and is unaffected by this.
-- That is why it must never reach the browser.
-- ───────────────────────────────────────────────────────────────────────────
alter table public.meetings enable row level security;

-- FORCE applies RLS even to the table's owner. Without this, a query running
-- as the owning role silently skips every policy. Belt and braces.
alter table public.meetings force row level security;


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
--     Expect: relrowsecurity = true, relforcerowsecurity = true

-- 4b. Confirm no policies grant anon access:
--
--     select policyname, roles, cmd
--     from pg_policies
--     where tablename = 'meetings';
--
--     Expect: zero rows.

-- 4c. The real test — from the DEPLOYED SITE's browser console:
--
--     const { data, error } = await supabase.from('meetings').select('*')
--     console.log(data, error)
--
--     Expect: data is empty, or an error. If you see names and email
--     addresses, this migration did not apply. Stop and fix it.
--
--     Then confirm the view still works:
--
--     await supabase.from('booked_slots').select('*')
--
--     Expect: rows containing only date and time.


-- ═══════════════════════════════════════════════════════════════════════════
-- FOLLOW-UP (not in this migration — kept separate on purpose)
--
-- Migrations should do one thing. Bundling unrelated changes makes them
-- harder to review and impossible to roll back independently.
--
-- Still outstanding:
--
--   • Netlify function must switch from SUPABASE_ANON_KEY to
--     SUPABASE_SERVICE_ROLE_KEY. Until it does, its INSERT will now FAIL,
--     because the revoke above applies to it too. Do these together.
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
