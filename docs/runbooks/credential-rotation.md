# Runbook — Credential rotation

**Use when:** a secret has leaked, or on a scheduled rotation.
**Time:** about 45 minutes.
**Related:** [ADR 0001](../decisions/0001-secrets-out-of-version-control.md),
[ADR 0002](../decisions/0002-email-identity-separation.md)

> **Nobody should send these values to anyone, including an AI assistant.**
> Every step below is done by you, in a browser or a terminal. Any tool that
> needs a secret should be given a *variable name*, never a value. If a value
> ever appears in a chat window, a log, or a screenshot, treat it as burned and
> start this runbook over.

---

## Phase 1 — Revoke (do this first, before anything else)

Revoking comes before creating replacements. If you create new credentials
first, there's a window where both old and new are valid, and you may forget to
close it.

### 1.1 Gmail app password

1. Go to https://myaccount.google.com/apppasswords (signed in as the **old**
   account, `cosmiccodearcher@gmail.com`).
2. Find the app password used by this project. Click the trash icon.
3. While you're here: https://myaccount.google.com/security — check "Your
   devices" and "Third-party apps with account access" for anything you don't
   recognise. Sign out of unknown sessions.
4. Confirm 2FA is on for this account. An app password is only as strong as the
   account it belongs to.

The booking confirmation emails will now fail. That's expected and correct.
Better broken than impersonable.

### 1.2 Supabase keys

1. Supabase dashboard → your project → Settings → API.
2. Note that the **anon key** and **service role key** are both derived from the
   project's JWT secret.
3. Settings → API → **Rotate JWT secret**. This invalidates both keys at once.

> ⚠️ Rotating the JWT secret signs out every authenticated user and breaks
> every deployed client until you update the environment variables. Since this
> project has no user accounts yet, the impact is limited to the booking page
> not loading slots for a few minutes. Do it now while that's still true —
> this gets much more disruptive once the vault feature exists.

### 1.3 Check for other exposure

Search the repo for anything else that shouldn't be there:

```bash
git grep -niE "(password|secret|api[_-]?key|token|bearer)" -- ':!package-lock.json'
```

Review each hit. Variable *names* are fine; literal values are not.

---

## Phase 2 — Move the account of record

Per ADR 0002, service accounts move to `gackmar@gmail.com`.

### 2.1 Prepare the new account

1. Sign in to `gackmar@gmail.com`.
2. Enable 2FA. Use an authenticator app, not SMS.
3. Save the backup codes somewhere offline. If you lose access to this account
   you lose access to the infrastructure it owns.

### 2.2 Transfer or re-point services

| Service | Action |
|---------|--------|
| **GitHub** | Settings → Emails → add `gackmar@`, verify, set as primary. Keep the old one attached until you've confirmed commit attribution still works. |
| **Netlify** | Team settings → invite `gackmar@` as an owner, accept, then remove the old account. |
| **Supabase** | Project → Settings → Team → invite `gackmar@` as Owner, accept, then remove the old account. |

Do these one at a time and verify each before moving on. Locking yourself out
of your own deployment is a recoverable but tedious mistake.

### 2.3 New Gmail app password

1. Signed in as `gackmar@gmail.com`, go to
   https://myaccount.google.com/apppasswords
2. Create one named `portfolio-booking-netlify`. Naming matters — in a year
   you'll want to know what a given password is for without guessing.
3. Copy it straight into Netlify (next step). Don't put it in a file.

---

## Phase 3 — Clean the repository

```bash
# Stop tracking .env while keeping your local copy
git rm --cached .env

# Confirm .gitignore now contains .env, then:
git add .gitignore .env.example
git commit -m "chore: remove .env from version control, add .env.example"
git push
```

### 3.1 Optional — scrub git history

The value is still in every historical commit. Since it's already rotated this
is hygiene rather than security, but it stops secret scanners flagging the repo
forever.

```bash
pip install git-filter-repo
git filter-repo --path .env --invert-paths --force
git remote add origin <your-repo-url>   # filter-repo drops the remote
git push --force --all
```

> ⚠️ This rewrites every commit hash. Anyone with an existing clone must
> re-clone. On a solo project that's you, so the cost is near zero — but never
> run this on a repo with collaborators without telling them first.

### 3.2 Turn on push protection

GitHub repo → Settings → Code security → enable **Secret scanning** and **Push
protection**. This blocks commits containing recognised credential formats
before they leave your machine. It would have caught this originally, and it
costs nothing.

---

## Phase 4 — Restore configuration

### 4.1 Local

Create `.env` in the project root, copying the shape of `.env.example`. This
file must never be committed; `.gitignore` now enforces that.

### 4.2 Netlify

Site → Site configuration → Environment variables. Set:

| Variable | Scope | Notes |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | Builds | Public. Inlined into the client bundle. |
| `VITE_SUPABASE_ANON_KEY` | Builds | Public by design. Safety comes from RLS, not secrecy. |
| `SUPABASE_SERVICE_ROLE_KEY` | Functions | **True secret.** Bypasses all RLS. Never prefix with `VITE_`. |
| `GMAIL_USER` | Functions | `gackmar@gmail.com` |
| `GMAIL_APP_PASSWORD` | Functions | **True secret.** From step 2.3. |
| `OPERATOR_EMAIL` | Functions | Where booking notifications go. |

The `VITE_` prefix is the dividing line and it's worth memorising: **`VITE_`
means "will be published to the world in the JavaScript bundle."** Everything
else stays server-side. Putting the service role key behind a `VITE_` prefix
would hand every visitor full database access.

### 4.3 Redeploy and verify

```bash
netlify deploy --prod   # or trigger from the dashboard
```

Then check:

- [ ] Site loads with no console errors
- [ ] Booking page shows already-taken slots as unavailable
- [ ] A test booking writes a row in Supabase
- [ ] Confirmation email arrives (check spam — see ADR 0002 on deliverability)
- [ ] Operator notification arrives at `gackmar@`

---

## Phase 5 — Close out

- [ ] Old app password revoked
- [ ] Supabase JWT secret rotated
- [ ] Services owned by `gackmar@`, 2FA on, backup codes stored offline
- [ ] `.env` untracked and ignored
- [ ] Push protection enabled
- [ ] All environment variables set in Netlify
- [ ] Full booking flow verified end to end

Record the date here each time you run this:

| Date | Reason | Run by |
|------|--------|--------|
| | Initial remediation — `.env` committed to public repo | |
