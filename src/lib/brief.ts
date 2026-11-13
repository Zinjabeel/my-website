import { z } from "zod";
import { BUDGETS, PROJECT_TYPES } from "./contact";

export const TIMELINES = ["As soon as possible", "Within 1–3 months", "Within 3–6 months", "Flexible"] as const;

/** A project brief. Mirrors the checks on the `project_briefs` table (see supabase/migrations). */
export const briefSchema = z.object({
  company: z.string().trim().min(2, "Enter your company name.").max(120, "Please shorten the company name."),
  website: z
    .string()
    .trim()
    .max(200, "That address is too long.")
    .refine((v) => v === "" || /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v), "Enter a website address like example.com.")
    .optional()
    .or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES, { message: "Choose a project type." }),
  goals: z.string().trim().min(30, "Tell us a little more — at least 30 characters.").max(5000, "Please keep this under 5,000 characters."),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  timeline: z.enum(TIMELINES).optional().or(z.literal("")),
});

export type BriefInput = z.infer<typeof briefSchema>;

export type BriefRow = {
  id: string;
  company: string;
  website: string | null;
  project_type: string;
  goals: string;
  budget: string | null;
  timeline: string | null;
  status: "received" | "in_review" | "replied" | "closed";
  created_at: string;
};

export const STATUS_LABEL: Record<BriefRow["status"], string> = {
  received: "Received",
  in_review: "In review",
  replied: "Replied",
  closed: "Closed",
};
