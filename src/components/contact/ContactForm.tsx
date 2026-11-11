"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { BUDGETS, PROJECT_TYPES, contactSchema, fieldErrors, type FieldErrors } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "error";

const fieldCls =
  "w-full rounded-[10px] border bg-paper-2 px-4 text-[1rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-ink focus:shadow-[0_0_0_3px_rgb(255_91_31/0.25)] aria-[invalid=true]:border-danger";

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-[0.95rem] font-medium">
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
        <p id={`${id}-error`} className="mt-2 text-[0.875rem] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-[12px] bg-night p-8 text-paper outline-none md:p-12"
      >
        <span className="grid size-12 place-items-center rounded-full bg-signal text-signal-ink">
          <Check className="size-6" aria-hidden />
        </span>
        <h2 className="display mt-8 text-[clamp(2.4rem,5vw,4.5rem)]">Message received.</h2>
        <p className="mt-4 max-w-md text-fog">
          Thanks for reaching out. We read every enquiry personally and will get back to you with next steps.
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus("idle");
          }}
          className="label mt-8 text-paper underline underline-offset-4 hover:text-signal"
        >
          Send another message
        </button>
      </div>
    );
  }

  const describe = (k: keyof FieldErrors) => (errors[k] ? `${k}-error` : undefined);

  return (
    <form ref={formRef} onSubmit={onSubmit} onInput={onFormInput} onChange={onFormInput} noValidate className="space-y-6" aria-describedby="form-note">
      {formError && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-[10px] border border-danger/40 bg-danger/5 px-4 py-3 text-danger outline-none">
          {formError}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            className={`${fieldCls} h-13`}
            aria-invalid={!!errors.name}
            aria-describedby={describe("name")}
            onBlur={() => validateField("name")}
            required
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={`${fieldCls} h-13`}
            aria-invalid={!!errors.email}
            aria-describedby={describe("email")}
            onBlur={() => validateField("email")}
            required
          />
        </Field>
      </div>

      <Field id="company" label="Company" optional error={errors.company}>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          className={`${fieldCls} h-13`}
          aria-invalid={!!errors.company}
          aria-describedby={describe("company")}
        />
      </Field>

      <fieldset>
        <legend className="mb-3 text-[0.95rem] font-medium">
          Project type<span className="text-signal" aria-hidden> *</span>
        </legend>
        <div className="flex flex-wrap gap-2" aria-describedby={describe("projectType")}>
          {PROJECT_TYPES.map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="projectType"
                value={t}
                className="peer sr-only"
              />
              <span className="inline-flex h-11 items-center rounded-full border hairline bg-paper-2 px-4 text-[0.95rem] transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal hover:border-ink">
                {t}
              </span>
            </label>
          ))}
        </div>
        {errors.projectType && (
          <p id="projectType-error" className="mt-2 text-[0.875rem] text-danger">
            {errors.projectType}
          </p>
        )}
      </fieldset>

      <Field id="budget" label="Budget" optional error={errors.budget}>
        <select id="budget" name="budget" defaultValue="" className={`${fieldCls} h-13 appearance-none`}>
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
          className={`${fieldCls} resize-y py-3.5 leading-relaxed`}
          placeholder="What does your company do, and what should the new website achieve?"
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

      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-[0.875rem] text-muted">
          Fields marked <span className="text-signal">*</span> are required. We only use your details to reply.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex h-13 items-center justify-center gap-3 rounded-[10px] bg-ink pl-6 pr-2 font-semibold text-paper transition-[background-color,transform] hover:bg-ink-2 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
          <span className="grid size-9 place-items-center rounded-[7px] bg-signal text-signal-ink" aria-hidden>
            {status === "submitting" ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
          </span>
        </button>
      </div>
    </form>
  );
}
