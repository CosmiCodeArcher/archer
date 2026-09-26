# Runbook — Review bundles

**Use when:** Claude Code has applied a patch, finished a local task, or done
anything else in the repo that a chat review session should check.
**Time:** Claude Code writes it. You read it and pass it on.

## Why bundles exist

The chat session can clone the public repo, so it sees *what* landed on
GitHub. It can't see *how* it got there: what ran on your machine, what failed
and was retried, which judgement calls were made, what was noticed and left
alone, and what you did by hand in a dashboard. The bundle carries exactly
that. The diff is the easy part; the reasoning is why the bundle exists.

## Where bundles live

**Outside the repo**, in a folder next to it:

- Windows: `%USERPROFILE%\archer-reviews\`
- Linux/macOS: `~/archer-reviews/`

Never inside the repo. Bundles contain local paths, full command output and
sometimes screenshots, and none of that belongs in a public history.

**Naming:** `YYYY-MM-DD_NN_<shorthash>_<slug>.md`, where `NN` is that day's
sequence number. For example:
`2026-09-26_01_c780d50_apply-0003-docs-correct-leak-claim.md`.

**The bundle is a single `.md` file** (owner's standing rule, 2026-09-26). No
`.patch` file beside it: the patch is already in the Downloads folder and on
GitHub as a commit.

## What goes in

Use these sections, in this order. Leave a section in with "none" rather than
dropping it; an explicit "none" is information.

1. **Header table:** date, operation, resulting commit and its parent, pushed
   or not, files changed with +/− counts, and the roadmap step ID it serves.
2. **What was asked:** the instructions, restated. Flag anything that was
   ambiguous, truncated or contradictory, and how it was read.
3. **What was done:** each command and its result, in order. Include lint and
   build results as **counts compared with before**: "27 errors before, 27
   after" says far more than "lint failed".
4. **Judgement calls:** every decision the instructions didn't cover, with the
   reasoning.
5. **Plain-terms walkthrough:** what each changed file now does, for the
   owner's learning.
6. **Issues found, not fixed:** anything noticed outside the scope. Report
   these; don't fix them. Out-of-scope fixes make diffs harder to review and
   blur what each commit was for.
7. **Beyond the instructions:** anything done that wasn't asked for, even
   read-only checks.
8. **Owner steps:** anything done by hand in Netlify, Supabase, GitHub or
   elsewhere. Record *what* was set, never the value: "set
   `SUPABASE_SECRET_KEY` in Netlify (Functions scope)".
9. **How to undo:** the exact commands, given whether the change was pushed.
10. **No diff appendix.** The chat session reads diffs from GitHub by commit
    hash. The bundle is for what the diff can't show. Exception: if the commit
    wasn't pushed, say so, and include the diff so the review isn't blocked.

## Hard rules

- **No secret values, ever.** No keys, tokens, passwords or `.env` contents,
  not even partially. Redact any command output that echoes one. If a secret
  appears in a bundle, treat it as leaked:
  `docs/runbooks/credential-rotation.md`.
- **Report reality, not intentions.** "Tested" means the check was run and its
  result recorded. If something couldn't be checked, say so.
- **Pre-existing problems stay separate.** Mark clearly what the operation
  caused versus what was already broken.

## What the chat session does with a bundle

1. Checks the bundle against the pushed commit on GitHub.
2. Replies with a review: what's confirmed, what's wrong, and answers to
   anything flagged.
3. Folds anything found into the next patch, or into `CLAUDE.md` Known
   problems, and updates the roadmap step's status.
