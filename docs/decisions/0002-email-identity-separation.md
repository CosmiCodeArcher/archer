# 0002 — Separate the four email identities

**Status:** Accepted
**Date:** 2026-08-30

## Context

A single Gmail address (`cosmiccodearcher@gmail.com`) was doing four unrelated
jobs across the codebase, and a second address (`ochiponumusa@gmail.com`) had
drifted into one file. There was concern that neither available Gmail address
reads as professional to a client or hiring engineer.

That concern is correct, but "which email should I use" is hard to answer
because it is actually four questions wearing one hat. Once separated, each has
an obvious answer.

## The four identities

| # | Identity | Job | Ever public? | Changes often? |
|---|----------|-----|--------------|----------------|
| 1 | **Account owner** | Owns the GitHub / Netlify / Supabase / domain accounts | Never | Never — this must be stable for years |
| 2 | **Operator inbox** | Receives "new meeting booked" notifications | Never | Rarely |
| 3 | **Sender identity** | The `From:` on confirmation emails to clients | Yes, visible in every email sent | Occasionally |
| 4 | **Public contact** | Displayed on the site as "email me" | Yes, and scraped by bots | Whenever branding changes |

Only **#3 and #4 need to read as professional.** #1 and #2 are private
plumbing and their aesthetics are irrelevant. The anxiety about the Gmail
addresses was really only ever about two of the four.

## Decision

**Now (development phase):**

- **#1 Account owner → `gackmar@gmail.com`.** Rotate all service accounts to
  this address. Enable 2FA. Never display it anywhere.
- **#2 Operator inbox → `gackmar@gmail.com`.** Same address is fine; these two
  roles have identical privacy properties.
- **#3 Sender → `gackmar@gmail.com`** via Gmail SMTP, as an interim.
- **#4 Public contact → `gackmar@gmail.com`** as an interim, but read from a
  single config constant (`src/config/site.js`) so it is a one-line change
  later.

**Later (before showing the site to clients or applying for roles):**

- Register a name-based domain. `awodi.dev` or similar.
- **#4 becomes `hello@awodi.dev`**, forwarded free via Cloudflare Email
  Routing to `gackmar@gmail.com`.
- **#3 moves to a transactional email service** (Resend or Postmark) sending
  from `bookings@awodi.dev`.

## Reasoning

**Why neither Gmail works for the public-facing roles.** `cosmiccodearcher@`
reads as a gamer handle. It's memorable and consistent with the site's playful
identity, which is a genuine argument for it, but it front-loads whimsy before
the recipient knows anything else about you. `gackmar@` is worse for the
opposite reason: it communicates nothing at all, so it reads as a throwaway.

Both share the deeper problem that any `@gmail.com` on a portfolio signals
"hobbyist" to some readers, fairly or not. A domain address signals that you own
your own infrastructure — which, for a developer, is the entire claim being
made.

**Why a name-based domain rather than a brand-based one.** Handles go stale.
"CosmiCodeArcher" is a 2025 identity; there's no guarantee it's a 2030 one.
Your name doesn't expire. `awodi.dev` will be as accurate in ten years as it is
today, and it never has to be re-explained. A domain costs roughly $12–15 a
year, which is the cheapest permanent fix to this entire category of worry.

**Why move off Gmail SMTP for transactional mail eventually.** This is the part
most worth understanding, because it's a real engineering reason and not
aesthetics:

- **Deliverability.** Booking confirmations sent through personal Gmail SMTP
  frequently land in spam, because the message claims to be transactional mail
  from a domain with no SPF/DKIM/DMARC records authorising it. A client books a
  meeting, never sees the confirmation, and doesn't show up. A dedicated
  service handles those DNS records for you.
- **Blast radius.** An app password is an all-or-nothing grant on your entire
  personal mailbox. A Resend API key can only send email, and revoking it
  breaks one feature instead of locking you out of your life.
- **Account safety.** Automated sending from a personal Gmail can trip Google's
  abuse heuristics. Getting your primary account suspended because a booking
  form got hammered is a bad day.

Resend's free tier covers 3,000 emails per month, which is far beyond what a
portfolio booking form will ever use.

**Why a single config constant is the load-bearing part of this decision.**
The stated goal was "change only the contact email later." That is only cheap
if the address exists in exactly one place. Right now it's hardcoded in
`Contact.jsx`, `ContactPage.jsx`, and the Netlify function, and those copies
have already drifted apart. `src/config/site.js` makes the future change a
one-line diff instead of a search-and-replace across files you'll forget exist.

This generalises: **any value you expect to change later should have exactly
one home.** The cost of centralising is a few minutes now; the cost of not
doing it is a bug you find six months later when a client emails an address you
abandoned.

## Consequences

**Costs:**
- One indirection layer between components and the contact address.
- A domain is a small recurring expense and a DNS configuration step.
- Rotating service accounts to a new Google account means re-authenticating
  GitHub, Netlify, and Supabase, and re-issuing keys.

**Enables:**
- Rebranding the public identity without touching component code.
- A professional front door that doesn't depend on which Gmail you happened to
  register first.
- A clean path to real transactional email when booking volume justifies it.

## Rejected alternatives

- **Keep `cosmiccodearcher@` everywhere.** Rejected: no separation between
  public and private identity means the address you show clients is the same
  one that owns your infrastructure, so you can never change one without the
  other.
- **Buy the domain immediately, before anything else.** Rejected as sequencing,
  not as an idea. Credentials are currently compromised; that's the emergency.
  The domain is a 30-minute task that can happen any time this month.
- **Google Workspace for custom-domain email.** Rejected for now at roughly $7
  per user per month. Cloudflare Email Routing plus Gmail's "send as" achieves
  the same visible result for free until there's a reason to need a real
  mailbox.
