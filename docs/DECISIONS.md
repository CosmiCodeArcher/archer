# Decision Log

This folder is the memory of the project. Code shows *what* the system does.
These documents show *why* it does it that way, and what was considered and
rejected.

## Why this exists

Three reasons, in order of how much they'll matter to you:

1. **Six-months-from-now you.** You will come back to `MeetingScheduler.jsx`
   and wonder why bookings are stored in UTC instead of local time. Without a
   record, you'll either re-derive the reasoning (slow) or "simplify" it back
   into the bug it was written to fix (worse).
2. **Context for future work.** When you add a new wing to the site, or hand
   part of it to a collaborator or an AI assistant, this folder is the briefing
   document. It's far more useful than reading 4,000 lines of JSX.
3. **It's a portfolio artifact in its own right.** A repo with a reasoned
   decision log reads as professional in a way that no amount of animation
   does. Most portfolios don't have one.

## Format

Each decision is a numbered file in `decisions/`. The format is a lightweight
ADR (Architecture Decision Record), an industry-standard pattern. Each one has:

- **Status** — Accepted, Superseded, or Proposed
- **Context** — what was true that forced a decision
- **Decision** — what we're doing
- **Reasoning** — why, including options rejected and why they lost
- **Consequences** — what this costs us, and what it now enables

Records are **append-only**. When a decision changes, you don't edit the old
file. You write a new record and mark the old one `Superseded by 00XX`. The
history of your thinking is the valuable part.

Two kinds of edit to an old record *are* allowed, because neither rewrites
history:

- **The Status line** changes when a later record supersedes or amends it.
  That's what the line is for.
- **A dated Erratum** may be added above Context when the record states a
  *fact* that turns out to be false. The wrong text stays in place, and the
  erratum explains what was wrong and whether the decision still stands. See
  0001 for an example.

The Context, Decision, Reasoning and Consequences text is never rewritten.
If the *decision* was wrong, that's a new record, not an erratum.

## Roadmap

The *plan* lives in [ROADMAP.md](ROADMAP.md): what happens in what order, and
why. Decisions record why things are built the way they are. The roadmap
records what's being built next. When a roadmap step makes an architectural
choice, it produces an ADR here.

## Runbooks

`runbooks/` holds step-by-step operational procedures — things you *do* rather
than things you *decided*. Credential rotation, deploys, incident response.
The distinction matters: decisions get superseded, runbooks get executed.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](decisions/0001-secrets-out-of-version-control.md) | Secrets out of version control | Accepted |
| [0002](decisions/0002-email-identity-separation.md) | Separate the four email identities | Accepted |
| [0003](decisions/0003-supabase-publishable-and-secret-keys.md) | Adopt Supabase publishable and secret keys | Accepted — amends 0001 |

## Runbook index

| Runbook | When to use |
|---------|-------------|
| [credential-rotation.md](runbooks/credential-rotation.md) | A secret leaked, or on a scheduled rotation |
| [applying-patches.md](runbooks/applying-patches.md) | Receiving a `.patch` file from a Claude chat review session |
| [supabase-key-cutover.md](runbooks/supabase-key-cutover.md) | Moving to publishable/secret keys and locking the `meetings` table (hotfix 0008) |
| [review-bundles.md](runbooks/review-bundles.md) | After applying a patch or finishing a local task: what to report back |
