"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { BUDGETS, PROJECT_TYPES } from "@/lib/contact";
import { briefSchema, TIMELINES, type BriefInput } from "@/lib/brief";

type Errors = Partial<Record<keyof BriefInput, string>>;

function Row({ id, label, optional, error, hint, children }: { id: string; label: string; optional?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        <span>
          {label}
          {!optional && (
            <span className="text-signal" aria-hidden>
              {" "}
              *
            </span>
          )}
        </span>
        {optional && <span className="label text-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[0.8125rem] text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The brief form. Signed-out visitors see it locked, with the login / sign-up dialog
 * opening on arrival; once signed in, the brief is saved to their account.
 */
export function StartClient() {
  const { user, ready, configured, displayName, openAuth } = useAuth();
  const prompted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Arriving signed-out opens the account dialog once.
  useEffect(() => {
    if (!ready) return;
    // Only prompt when someone ARRIVES signed out — never right after they log out or delete their account.
    if (user) prompted.current = true;
    if (prompted.current) return;
    prompted.current = true;
    openAuth("signup");
  }, [ready, user, openAuth]);

  useEffect(() => {
    if (done) doneRef.current?.focus();
  }, [done]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = briefSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof BriefInput;
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    const sb = getSupabase();
    if (!sb || !user) return;
    setErrors({});
    setFormError("");
    setBusy(true);
    const d = parsed.data;
    const { error } = await sb.from("project_briefs").insert({
      company: d.company,
      website: d.website || null,
      project_type: d.projectType,
      goals: d.goals,
      budget: d.budget || null,
      timeline: d.timeline || null,
    });
    setBusy(false);
    if (error) {
      setFormError(
        error.message.includes("brief_rate_limit")
          ? "You've sent several briefs today. Please wait until tomorrow, or contact us directly."
          : "We couldn't save your brief. Please try again in a moment.",
      );
      return;
    }
    setDone(true);
  }

  function onInput(e: React.FormEvent<HTMLFormElement>) {
    const name = (e.target as HTMLInputElement).name as keyof BriefInput;
    if (name && errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  }

  if (!ready) {
    return (
      <div className="card p-8" aria-busy="true">
        <div className="h-6 w-40 animate-pulse rounded bg-paper-3" />
        <div className="mt-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-paper-3" />
          ))}
        </div>
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card card-hard p-7 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-ink text-paper">
          <Lock className="size-5" aria-hidden />
        </span>
        <h2 className="display mt-6 text-[clamp(1.7rem,3vw,2.4rem)]">Log in or create an account to continue.</h2>
        <p className="lead mt-4 max-w-lg">
          Your brief is saved to your account, so you can follow its status and we can reply to you directly. It&apos;s free and
          takes a minute.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-signal" onClick={() => openAuth("signup")}>
            Create account <ArrowRight className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-outline" onClick={() => openAuth("login")}>
            Log in
          </button>
        </div>
        {!configured && (
          <p role="status" className="mt-6 rounded-md border border-signal/60 bg-signal/10 px-3.5 py-3 text-[0.875rem]">
            Accounts aren&apos;t switched on yet. Until they are, please use the{" "}
            <Link href="/contact" className="link-underline font-semibold">
              contact form
            </Link>
            .
          </p>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div ref={doneRef} tabIndex={-1} role="status" className="card card-hard p-7 outline-none md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-signal text-signal-ink">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="display h-section mt-7">Brief received.</h2>
        <p className="lead mt-4 max-w-lg">
          Thank you{displayName ? `, ${displayName}` : ""}. We read every brief personally and will reply with questions, first
          thoughts and next steps.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/account" className="btn btn-primary">
            View your briefs <ArrowRight className="size-4" aria-hidden />
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => setDone(false)}>
            Send another
          </button>
        </div>
      </div>
    );
  }

  const describe = (k: keyof BriefInput) => (errors[k] ? `${k}-error` : undefined);

  return (
    <form ref={formRef} onSubmit={submit} onInput={onInput} onChange={onInput} noValidate className="card card-hard space-y-5 p-6 md:p-9">
      <div className="flex items-center justify-between gap-4 border-b hairline pb-5">
        <p className="h-card">Your project brief</p>
        <p className="label text-muted">Signed in as {user.email}</p>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-danger/50 bg-danger/5 px-4 py-3 text-danger">
          {formError}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Row id="company" label="Company" error={errors.company}>
          <input id="company" name="company" autoComplete="organization" className="field" aria-invalid={!!errors.company} aria-describedby={describe("company")} required />
        </Row>
        <Row id="website" label="Current website" optional error={errors.website}>
          <input id="website" name="website" inputMode="url" autoComplete="url" placeholder="example.com" className="field" aria-invalid={!!errors.website} aria-describedby={describe("website")} />
        </Row>
      </div>

      <fieldset>
        <legend className="field-label">
          <span>
            What do you need?
            <span className="text-signal" aria-hidden>
              {" "}
              *
            </span>
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input type="radio" name="projectType" value={t} className="peer sr-only" />
              <span className="inline-flex h-10 items-center rounded-[6px] border-[1.5px] border-ink/30 bg-white px-3.5 text-[0.9rem] font-medium transition-colors hover:border-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal">
                {t}
              </span>
            </label>
          ))}
        </div>
        {errors.projectType && (
          <p id="projectType-error" className="field-error">
            {errors.projectType}
          </p>
        )}
      </fieldset>

      <Row id="goals" label="What should the website achieve?" error={errors.goals} hint="What your company does, who it's for and what a good result looks like.">
        <textarea id="goals" name="goals" rows={6} className="field" aria-invalid={!!errors.goals} aria-describedby={describe("goals")} required />
      </Row>

      <div className="grid gap-5 sm:grid-cols-2">
        <Row id="budget" label="Budget" optional error={errors.budget}>
          <select id="budget" name="budget" defaultValue="" className="field">
            <option value="">Select a range</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Row>
        <Row id="timeline" label="Timeline" optional error={errors.timeline}>
          <select id="timeline" name="timeline" defaultValue="" className="field">
            <option value="">Select a timeline</option>
            {TIMELINES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Row>
      </div>

      <div className="flex flex-col gap-4 border-t hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.875rem] text-muted">
          Fields marked <span className="text-signal">*</span> are required.
        </p>
        <button type="submit" disabled={busy} className="btn btn-signal">
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {busy ? "Sending…" : "Send brief"}
          {!busy && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    </form>
  );
}
