/**
 * Supabase browser client — single shared instance.
 *
 * Why a singleton
 * ───────────────
 * `createClient()` was previously called at the top of MeetingScheduler.jsx.
 * That worked because only one component needed it. The moment a second
 * feature does (the vault, saved articles, anything with auth), a second
 * `createClient` call creates a second client with its own auth state and its
 * own realtime websocket. They then disagree about who is signed in, in ways
 * that are painful to debug.
 *
 * One module, one client, imported everywhere.
 *
 * SECURITY NOTE
 * ─────────────
 * This client authenticates with the ANON key, which is public and visible in
 * the browser bundle. It is not a secret and does not need to be one.
 *
 * What protects the database is Row Level Security. Assume every query written
 * against this client could be modified by a visitor in devtools and re-run
 * with arbitrary arguments — because it can be. RLS is the only thing standing
 * between this client and your data.
 *
 * See supabase/migrations/0001_meetings_rls.sql
 */

import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabase = env.isConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        // No user accounts yet. Disabling session persistence avoids writing
        // auth state to localStorage for no reason.
        // Flip these to true when the vault feature introduces real auth.
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Call before any query. Returns the client or throws with a useful message.
 *
 * Consuming code should handle the throw and degrade gracefully — show
 * "booking temporarily unavailable" rather than crashing the page.
 */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and " +
        "VITE_SUPABASE_ANON_KEY. See docs/runbooks/credential-rotation.md"
    );
  }
  return supabase;
}

export default supabase;
