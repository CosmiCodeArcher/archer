/**
 * Validated client-side environment access.
 *
 * Why this exists
 * ───────────────
 * MeetingScheduler.jsx previously did:
 *
 *     const supabase = createClient(
 *       import.meta.env.VITE_SUPABASE_URL,
 *       import.meta.env.VITE_SUPABASE_ANON_KEY
 *     );
 *
 * If either variable is missing in a deploy, that call does not throw. It
 * returns a client object that looks fine and fails later, inside a network
 * call, with an error that points at the wrong thing. You would spend an hour
 * debugging Supabase before checking your Netlify settings.
 *
 * The principle: fail at the earliest point where the problem is DETECTABLE,
 * not at the point where it becomes VISIBLE. A missing env var is detectable
 * at module load. So we check there.
 *
 * See docs/decisions/0001-secrets-out-of-version-control.md
 */

/**
 * Only VITE_-prefixed variables exist in client code. Vite substitutes them
 * at build time — there is no `process.env` in the browser.
 *
 * Note this must be written as a literal property access
 * (`import.meta.env.VITE_FOO`), not a dynamic lookup
 * (`import.meta.env[name]`). Vite performs a static text substitution during
 * the build; a dynamic key has nothing to substitute and resolves to
 * undefined in production while appearing to work in dev. This is a
 * genuinely nasty bug class — it only shows up after deploy.
 */
const raw = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

const missing = Object.entries(raw)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  const message =
    `Missing required environment variables: ${missing.join(", ")}.\n\n` +
    `Local:      copy .env.example to .env and fill in the values.\n` +
    `Production: Netlify → Site configuration → Environment variables.\n\n` +
    `See docs/runbooks/credential-rotation.md`;

  // Throw in development so the failure is immediate and unmissable.
  // In production, log loudly but let the app boot — a missing booking
  // integration should degrade the scheduler, not white-screen the whole
  // portfolio. Graceful degradation over total failure, for a site whose
  // primary job is showing your work.
  if (import.meta.env.DEV) {
    throw new Error(message);
  } else {
    console.error(`[env] ${message}`);
  }
}

export const env = Object.freeze({
  supabaseUrl: raw.VITE_SUPABASE_URL,
  supabaseAnonKey: raw.VITE_SUPABASE_ANON_KEY,
  /** True when every required variable is present. Guard features with this. */
  isConfigured: missing.length === 0,
});

export default env;
