import { z } from "zod";

export const PROJECT_TYPES = [
  "New website",
  "Website redesign",
  "E-commerce",
  "Landing page / campaign",
  "Web application",
  "Something else",
] as const;

export const BUDGETS = ["Under €5k", "€5k – €10k", "€10k – €25k", "€25k+", "Not sure yet"] as const;

/** Shared by the client form (instant feedback) and the API route (authoritative check). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "That name is a bit long."),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address.").max(200),
  company: z.string().trim().max(120, "Please shorten the company name.").optional().or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES, { message: "Please choose a project type." }),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters.")
    .max(5000, "Please keep the message under 5,000 characters."),
  // Anti-spam: honeypot must stay empty; form must not be submitted instantly.
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type FieldErrors = Partial<Record<keyof ContactInput, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ContactInput;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Escape user content before placing it into the HTML email. */
export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
