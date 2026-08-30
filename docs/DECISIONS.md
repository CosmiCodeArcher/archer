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

## Runbooks

`runbooks/` holds step-by-step operational procedures — things you *do* rather
than things you *decided*. Credential rotation, deploys, incident response.
The distinction matters: decisions get superseded, runbooks get executed.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](decisions/0001-secrets-out-of-version-control.md) | Secrets out of version control | Accepted |
| [0002](decisions/0002-email-identity-separation.md) | Separate the four email identities | Accepted |

## Runbook index

| Runbook | When to use |
|---------|-------------|
| [credential-rotation.md](runbooks/credential-rotation.md) | A secret leaked, or on a scheduled rotation |
