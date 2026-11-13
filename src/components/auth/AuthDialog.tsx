"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, MailCheck, User as UserIcon, X } from "lucide-react";
import { z } from "zod";
import { authMessage, getSupabase, supabaseConfigured } from "@/lib/supabase";
import { checkPassword } from "@/lib/password";
import { LogoMark } from "@/components/site/Logo";
import type { AuthView } from "./AuthProvider";

type View = AuthView | "sent-confirm" | "sent-reset";

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(200);

function IconField({
  icon: Icon,
  label,
  error,
  trailing,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  error?: string;
  trailing?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          id={id}
          className={`field pl-10 ${trailing ? "pr-12" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-err`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  error,
  autoComplete,
  label = "Password",
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete: "current-password" | "new-password";
  label?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <IconField
      icon={Lock}
      label={label}
      type={show ? "text" : "password"}
      name="password"
      autoComplete={autoComplete}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded text-muted hover:text-ink"
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      }
    />
  );
}

export function PasswordStrength({ password, name, email }: { password: string; name?: string; email?: string }) {
  const { checks, score, label } = checkPassword(password, name, email);
  return (
    <div aria-live="polite">
      <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 rounded-full transition-colors ${
              score >= n ? (score <= 1 ? "bg-danger" : score <= 3 ? "bg-signal" : "bg-success") : "bg-paper-3"
            }`}
          />
        ))}
      </div>
      <p className="mt-2 text-[0.8125rem] font-semibold">
        <span className="sr-only">Password strength: </span>
        {label}
      </p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.id} className={`flex items-center gap-2 text-[0.8125rem] ${c.ok ? "text-ink" : "text-muted"}`}>
            <span
              className={`grid size-4 shrink-0 place-items-center rounded-[3px] border ${
                c.ok ? "border-success bg-success text-white" : "border-ink/30"
              }`}
              aria-hidden
            >
              {c.ok && <Check className="size-3" strokeWidth={3} />}
            </span>
            {c.label}
            <span className="sr-only">{c.ok ? " — met" : " — not met yet"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AuthDialog({ initialView, onClose }: { initialView: AuthView; onClose: () => void }) {
  const [view, setView] = useState<View>(initialView);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Modal behaviour: lock scroll, trap focus, Esc closes, restore focus on exit.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.__lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panel.current) return;
      const items = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      window.__lenis?.start();
      opener?.focus?.();
    };
  }, [onClose]);

  // Focus the first field whenever the view changes.
  useEffect(() => {
    const t = setTimeout(() => panel.current?.querySelector<HTMLElement>("input, [data-autofocus]")?.focus(), 60);
    setErrors({});
    setFormError("");
    return () => clearTimeout(t);
  }, [view]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const redirectTo = (path: string) => `${window.location.origin}${path}`;
  const here = () => window.location.pathname;

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    const errs: Record<string, string> = {};
    if (!parsed.success) errs.email = parsed.error.issues[0].message;
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setFormError("");
    const { error } = await sb.auth.signInWithPassword({ email: parsed.data!, password });
    setBusy(false);
    if (error) setFormError(authMessage(error));
    // On success the provider sees the session and closes this dialog.
  }

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    const pw = checkPassword(password, name, email);
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Enter your name.";
    if (!parsed.success) errs.email = parsed.error.issues[0].message;
    if (!pw.valid) errs.password = "Your password needs to meet every rule below.";
    if (!agree) errs.agree = "Please accept the terms to create an account.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setFormError("");
    const { data, error } = await sb.auth.signUp({
      email: parsed.data!,
      password,
      options: { data: { name: name.trim().slice(0, 100) }, emailRedirectTo: redirectTo(here()) },
    });
    setBusy(false);
    if (error) return setFormError(authMessage(error));
    if (!data.session) {
      setCooldown(60);
      setView("sent-confirm");
    }
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setErrors({ email: parsed.error.issues[0].message });
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setFormError("");
    const { error } = await sb.auth.resetPasswordForEmail(parsed.data, { redirectTo: redirectTo("/auth/reset") });
    setBusy(false);
    if (error) return setFormError(authMessage(error));
    setCooldown(60);
    setView("sent-reset");
  }

  async function resend() {
    const sb = getSupabase();
    if (!sb || cooldown > 0) return;
    setBusy(true);
    const { error } =
      view === "sent-confirm"
        ? await sb.auth.resend({ type: "signup", email: email.trim().toLowerCase(), options: { emailRedirectTo: redirectTo(here()) } })
        : await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: redirectTo("/auth/reset") });
    setBusy(false);
    if (error) setFormError(authMessage(error));
    else setCooldown(60);
  }

  const submitLabel = (text: string) => (
    <>
      {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {busy ? "One moment…" : text}
      {!busy && <ArrowRight className="size-4" aria-hidden />}
    </>
  );

  const heading: Record<View, { eyebrow: string; title: string; sub: string }> = {
    login: { eyebrow: "Your Launchly account", title: "Log in", sub: "Welcome back. Log in with the email you signed up with." },
    signup: { eyebrow: "Join Launchly", title: "Create your account", sub: "Free. It keeps your project briefs and replies in one place." },
    forgot: { eyebrow: "Reset password", title: "Forgot your password?", sub: "Enter your email and we'll send you a link to choose a new one." },
    "sent-confirm": { eyebrow: "Almost there", title: "Check your inbox", sub: "" },
    "sent-reset": { eyebrow: "Reset password", title: "Check your inbox", sub: "" },
  };
  const h = heading[view];

  return createPortal(
    <div className="fixed inset-0 z-[95] overflow-y-auto overscroll-contain" data-lenis-prevent>
      <div aria-hidden className="fixed inset-0 bg-ink/70 backdrop-blur-[3px]" />
      {/* min-h-full + flex keeps a tall dialog scrollable from its top edge on small screens */}
      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="card card-hard relative grid w-full max-w-[58rem] overflow-hidden bg-paper md:grid-cols-[0.82fr_1fr]"
        style={{ animation: "page-enter 0.4s var(--ease-out-expo) both" }}
      >
        {/* Pitch panel */}
        <div className="band-ink relative hidden flex-col justify-between p-9 md:flex">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.02em]">
              <LogoMark className="size-6" /> Launchly
            </span>
            <p className="display mt-12 text-[2.35rem]">
              One login.
              <br />
              Every launch.
            </p>
            <ul className="mt-8 space-y-4 text-[0.95rem] text-fog">
              {["Send your project brief in a few minutes", "Keep every brief and its status in one place", "A personal reply from the team, not a robot"].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-signal text-signal-ink" aria-hidden>
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="label text-fog">No tracking · No spam · Delete your account any time</p>
        </div>

        {/* Form panel */}
        <div className="relative p-6 sm:p-9">
          <button type="button" onClick={onClose} aria-label="Close" className="icon-btn absolute right-4 top-4 !size-9">
            <X className="size-4" aria-hidden />
          </button>

          {(view === "login" || view === "signup") && (
            <div role="tablist" aria-label="Account" className="mb-7 mr-12 grid grid-cols-2 rounded-[7px] border-[1.5px] border-ink p-1">
              {(
                [
                  ["login", "Log in"],
                  ["signup", "Create account"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`eyebrow h-9 whitespace-nowrap rounded-[4px] !text-[0.68rem] transition-colors sm:!text-xs ${view === v ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-3"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <p className="eyebrow text-signal">{h.eyebrow}</p>
          <h2 id={titleId} className="display mt-3 text-[clamp(1.75rem,3vw,2.25rem)]">
            {h.title}
          </h2>
          {h.sub && <p className="mt-2 text-[0.95rem] text-muted">{h.sub}</p>}

          {!supabaseConfigured && (
            <p role="status" className="mt-5 rounded-md border border-signal/60 bg-signal/10 px-3.5 py-3 text-[0.875rem]">
              <strong>Accounts aren&apos;t switched on yet.</strong> The site owner needs to connect the account service
              (see <code className="label">.env.example</code>). You can still reach us through the{" "}
              <Link href="/contact" onClick={onClose} className="link-underline font-semibold">
                contact form
              </Link>
              .
            </p>
          )}

          {formError && (
            <p role="alert" className="mt-5 rounded-md border border-danger/50 bg-danger/5 px-3.5 py-3 text-[0.875rem] text-danger">
              {formError}
            </p>
          )}

          {view === "login" && (
            <form onSubmit={login} noValidate className="mt-6 space-y-4">
              <IconField icon={Mail} label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
              <div>
                <PasswordField value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
                <div className="mt-2 text-right">
                  <button type="button" onClick={() => setView("forgot")} className="link-underline text-[0.8125rem] font-semibold">
                    Forgot password?
                  </button>
                </div>
              </div>
              <button type="submit" disabled={busy || !supabaseConfigured} className="btn btn-primary btn-block">
                {submitLabel("Log in")}
              </button>
              <p className="pt-1 text-center text-[0.875rem] text-muted">
                New to Launchly?{" "}
                <button type="button" onClick={() => setView("signup")} className="link-underline font-semibold text-ink">
                  Create an account
                </button>
              </p>
            </form>
          )}

          {view === "signup" && (
            <form onSubmit={signup} noValidate className="mt-6 space-y-4">
              <IconField icon={UserIcon} label="Name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required />
              <IconField icon={Mail} label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
              <div>
                <PasswordField value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
                <PasswordStrength password={password} name={name} email={email} />
              </div>
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-[0.875rem]">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-[var(--color-ink)]"
                    aria-invalid={!!errors.agree}
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/legal/terms" target="_blank" className="link-underline font-semibold">
                      Terms of Use
                    </Link>{" "}
                    and the{" "}
                    <Link href="/legal/privacy" target="_blank" className="link-underline font-semibold">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.agree && <p className="field-error">{errors.agree}</p>}
              </div>
              <button type="submit" disabled={busy || !supabaseConfigured} className="btn btn-primary btn-block">
                {submitLabel("Create account")}
              </button>
              <p className="pt-1 text-center text-[0.875rem] text-muted">
                Already have an account?{" "}
                <button type="button" onClick={() => setView("login")} className="link-underline font-semibold text-ink">
                  Log in
                </button>
              </p>
            </form>
          )}

          {view === "forgot" && (
            <form onSubmit={forgot} noValidate className="mt-6 space-y-4">
              <IconField icon={Mail} label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
              <button type="submit" disabled={busy || !supabaseConfigured} className="btn btn-primary btn-block">
                {submitLabel("Send reset link")}
              </button>
              <p className="text-center text-[0.875rem]">
                <button type="button" onClick={() => setView("login")} className="link-underline font-semibold">
                  Back to log in
                </button>
              </p>
            </form>
          )}

          {(view === "sent-confirm" || view === "sent-reset") && (
            <div className="mt-6">
              <span className="grid size-12 place-items-center rounded-full bg-signal text-signal-ink">
                <MailCheck className="size-6" aria-hidden />
              </span>
              <p className="mt-5 text-[1rem] text-ink-2">
                {view === "sent-confirm" ? (
                  <>
                    If <strong>{email.trim()}</strong> is new to Launchly, we&apos;ve sent it a confirmation link. Open it to finish
                    creating your account — you&apos;ll come straight back here.
                  </>
                ) : (
                  <>
                    If <strong>{email.trim()}</strong> has a Launchly account, we&apos;ve sent it a link to choose a new password.
                  </>
                )}
              </p>
              <p className="mt-3 text-[0.875rem] text-muted">Nothing after a minute? Check spam, or send it again.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" data-autofocus onClick={resend} disabled={busy || cooldown > 0} className="btn btn-outline btn-sm">
                  {cooldown > 0 ? `Send again in ${cooldown}s` : "Send again"}
                </button>
                <button type="button" onClick={() => setView("login")} className="btn btn-primary btn-sm">
                  Back to log in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>,
    document.body,
  );
}
