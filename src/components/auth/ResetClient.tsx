"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { PasswordStrength } from "./AuthDialog";
import { authMessage, getSupabase } from "@/lib/supabase";
import { checkPassword } from "@/lib/password";

/** Landing page for the "choose a new password" email link. */
export function ResetClient() {
  const { user, ready, displayName, openAuth } = useAuth();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [waited, setWaited] = useState(false);

  // The email link signs the visitor in a moment after the page loads.
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 2500);
    return () => clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkPassword(password, displayName, user?.email ?? "").valid) return setError("Your password needs to meet every rule below.");
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    const { error: err } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authMessage(err));
    setDone(true);
  }

  if (!ready || (!user && !waited)) {
    return (
      <div className="card max-w-xl p-8" aria-busy="true">
        <div className="h-6 w-48 animate-pulse rounded bg-paper-3" />
        <div className="mt-6 h-12 animate-pulse rounded bg-paper-3" />
        <span className="sr-only">Checking your link…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card card-hard max-w-xl p-7 md:p-10">
        <h2 className="display text-[clamp(1.7rem,3vw,2.4rem)]">This link has expired.</h2>
        <p className="lead mt-4">Reset links work once and for a limited time. Request a new one and we&apos;ll email it straight away.</p>
        <button type="button" className="btn btn-primary mt-8" onClick={() => openAuth("forgot")}>
          Send a new link <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div role="status" className="card card-hard max-w-xl p-7 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-signal text-signal-ink">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="display mt-6 text-[clamp(1.7rem,3vw,2.4rem)]">Password updated.</h2>
        <p className="lead mt-4">You&apos;re logged in with your new password.</p>
        <Link href="/account" className="btn btn-primary mt-8">
          Go to your account <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card card-hard max-w-xl space-y-5 p-7 md:p-10">
      <p className="label text-muted">Account — {user.email}</p>
      {error && (
        <p role="alert" className="rounded-md border border-danger/50 bg-danger/5 px-4 py-3 text-danger">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="new-password" className="field-label">
          New password
        </label>
        <div className="relative">
          <input
            id="new-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field pr-12"
            required
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink"
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
        <PasswordStrength password={password} name={displayName} email={user.email ?? ""} />
      </div>
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {busy ? "Saving…" : "Save new password"}
        {!busy && <ArrowRight className="size-4" aria-hidden />}
      </button>
    </form>
  );
}
