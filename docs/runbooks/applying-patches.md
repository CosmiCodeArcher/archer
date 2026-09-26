# Runbook — Applying a patch from a review session

**Use when:** a Claude chat session hands you a `.patch` file to bring into
the repo.
**Time:** 5–10 minutes, most of it reading the diff.

## How the loop works

```
  Claude (chat)                 You                    Claude Code (local)
  ─────────────                 ───                    ───────────────────
  clones public repo  ◄──────── git push
  writes change,
  runs lint + build
  git format-patch ───────────► download .patch
                                paste prompt ────────► apply --check
                                                       apply --3way
                                review diff  ◄──────── show staged diff
                                approve ─────────────► commit (message
                                                       from patch header)
                                git push ─────────────► (loop repeats)
```

The chat session works from a clone of the **public GitHub repo**, not your
disk. So a patch is only guaranteed to apply cleanly if your local `master`
matches GitHub when the patch was written. That's the one rule everything
below protects.

## What a patch file is

A patch is a diff saved to a file, with a header on top. The header comes from
`git format-patch` and carries the commit message, so the *reasoning* for the
change travels with the change itself.

Each file section says which file changed and shows hunks — blocks starting
`@@ -12,6 +12,9 @@`, meaning "at line 12, 6 old lines became 9 new lines."
Lines starting `-` are removed, `+` added, a space means unchanged context.

The context lines are how git finds *where* to apply the change. If your copy
of the file has drifted, the context won't match, and git refuses rather than
guessing. That refusal is a feature.

## Before asking for a patch

```bash
git status          # must say "nothing to commit, working tree clean"
git push            # GitHub must match your machine
```

Then tell the chat session your latest commit hash (`git log --oneline -1`), so
it can confirm it's working from the same starting point.

## Applying

Download the `.patch` file, then give Claude Code the prompt the chat session
supplies. The mechanics it runs are:

```bash
git apply --check --3way <file>.patch   # dry run: will it apply?
git apply --3way <file>.patch           # apply, and stage the result
git diff --staged                       # what changed
```

**Why `--3way`.** This repo stores files with LF line endings. On Windows,
git may check them out with CRLF. A plain `git apply` compares the patch's
context against your working files byte by byte, so every line mismatches on
the invisible `\r` and the patch "fails" for no real reason. `--3way` uses
the committed versions of the files instead of the working copies, which
sidesteps that entirely, and falls back to a normal merge if something
genuinely differs.

**Why `apply` and not `am`.** `git am` applies *and commits* in one step. That
skips your review. `git apply` stages the changes and stops, so you look
before anything is recorded.

## Reviewing

Open the diff in the desktop app. You're checking three things:

1. **Does it only touch what the patch said it would?** The commit message
   names the scope. Changes outside it are a red flag.
2. **Do I understand each hunk?** If not, ask Claude Code to explain that
   specific hunk before committing. This is the learning step; don't skip it.
3. **Does anything look like a secret?** A patch should never contain a key,
   password, or token. If one does, stop and don't commit.

## Committing

The commit message is already written in the patch header (everything from
`Subject:` down to the `---` line). Claude Code commits using it, so the
reasoning lands in `git log` permanently.

## If it fails

`git apply --check` failing means your files differ from what the patch
expected. Usually because you changed something since your last push, or the
patch was built from an older commit.

Don't hand-edit the patch to force it. Tell the chat session which hunk
failed and your current commit hash; it will regenerate against your actual
state. Forcing a patch onto files it wasn't written for is how you end up
with code that half-applies and breaks in ways that are hard to trace.

## To undo

Before committing:  `git restore --staged . && git restore .`
After committing:   `git reset --hard HEAD~1`  (only if not yet pushed)
After pushing:      `git revert HEAD`          (makes a new "undo" commit)
