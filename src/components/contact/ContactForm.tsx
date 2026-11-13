"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { BUDGETS, PROJECT_TYPES, contactSchema, fieldErrors, type FieldErrors } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
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
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** General enquiries. No account needed. */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  function readForm() {
    const fd = new FormData(formRef.current!);
    return { ...Object.fromEntries(fd.entries()), startedAt: startedAt.current };
  }

  /** On blur we only ever ADD an error (never remove one), so the layout can't shift under a click. */
  function validateField(name: keyof FieldErrors) {
    const parsed = contactSchema.safeParse(readForm());
    const msg = parsed.success ? undefined : fieldErrors(parsed.error)[name];
    if (msg) setErrors((prev) => (prev[name] === msg ? prev : { ...prev, [name]: msg }));
  }

  /** Errors disappear as soon as the visitor starts fixing the field. */
  function onFormInput(e: React.FormEvent<HTMLFormElement>) {
    const name = (e.target as HTMLInputElement).name as keyof FieldErrors;
    if (name && errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setFormError("");
    const data = readForm();
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const errs = fieldErrors(parsed.error);
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setStatus("success");
        formRef.current?.reset();
        return;
      }
      if (json.fields) setErrors(json.fields);
      setFormError(json.error || "Something went wrong. Please try again.");
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  if (status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="card card-hard p-8 outline-none md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-signal text-signal-ink">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h2 className="display h-section mt-7">Message received.</h2>
        <p className="lead mt-4 max-w-md">Thanks for reaching out. We read every message personally and will get back to you with next steps.</p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus("idle");
          }}
          className="btn btn-outline btn-sm mt-8"
        >
          Send another message
        </button>
      </div>
    );
  }

  const describe = (k: keyof FieldErrors) => (errors[k] ? `${k}-error` : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} onInput={onFormInput} onChange={onFormInput} noValidate className="space-y-5" aria-describedby="form-note">
      {formError && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-md border border-danger/50 bg-danger/5 px-4 py-3 text-danger outline-none">
          {formError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input id="name" name="name" autoComplete="name" className="field" aria-invalid={!!errors.name} aria-describedby={describe("name")} onBlur={() => validateField("name")} required />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className="field" aria-invalid={!!errors.email} aria-describedby={describe("email")} onBlur={() => validateField("email")} required />
        </Field>
      </div>

      <Field id="company" label="Company" optional error={errors.company}>
        <input id="company" name="company" autoComplete="organization" className="field" aria-invalid={!!errors.company} aria-describedby={describe("company")} />
      </Field>

      <fieldset>
        <legend className="field-label">
          <span>
            Project type
            <span className="text-signal" aria-hidden>
              {" "}
              *
            </span>
          </span>
        </legend>
        <div className="flex flex-wrap gap-2" aria-describedby={describe("projectType")}>
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

      <Field id="budget" label="Budget" optional error={errors.budget}>
        <select id="budget" name="budget" defaultValue="" className="field">
          <option value="">Select a range</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </Field>

      <Field id="message" label="Message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          className="field"
          placeholder="What does your company do, and what should the website achieve?"
          aria-invalid={!!errors.message}
          aria-describedby={describe("message")}
          onBlur={() => validateField("message")}
          required
        />
      </Field>

      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-4 border-t hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-[0.875rem] text-muted">
          Fields marked <span className="text-signal">*</span> are required. We only use your details to reply.
        </p>
        <button type="submit" disabled={status === "submitting"} className="btn btn-primary">
          {status === "submitting" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {status === "submitting" ? "Sending…" : "Send message"}
          {status !== "submitting" && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    </form>
  );
}
