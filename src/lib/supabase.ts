import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase powers accounts and project briefs.
 * Both values are public by design (the publishable key is safe in the browser);
 * what a visitor may read or write is enforced by row-level security in the database
 * (see supabase/migrations).
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

/** Browser client. Returns null until the two env values are set. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (!client) {
    client = createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}

/** Turns Supabase auth errors into plain, useful sentences. */
export function authMessage(error: { message?: string; code?: string; status?: number } | null | undefined): string {
  const code = error?.code ?? "";
  const msg = (error?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login")) return "That email and password don't match. Try again or reset your password.";
  if (code === "email_not_confirmed" || msg.includes("not confirmed")) return "Please confirm your email first — open the link we sent you.";
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit")) return "Too many emails requested. Please wait a few minutes and try again.";
  if (code === "over_request_rate_limit" || error?.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (code === "weak_password" || msg.includes("password should")) return "That password is too weak. Use at least 12 characters with letters and numbers.";
  if (code === "same_password") return "Choose a password you haven't used here before.";
  if (code === "user_already_exists" || msg.includes("already registered")) return "This email already has an account. Log in instead.";
  if (code === "captcha_failed") return "The security check didn't pass. Please try again.";
  if (msg.includes("failed to fetch") || msg.includes("network")) return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}
