import raw from "./projects.json";
import { z } from "zod";

/**
 * Single source of truth for portfolio projects.
 * Add a project by editing `projects.json` — or locally via /studio (dev only),
 * which inspects the URL, captures screenshots and writes the entry for you.
 */
export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  url: z.string().url(),
  /** Marks example/test entries. Shown with a visible "Example" badge. */
  placeholder: z.boolean().optional().default(false),
  year: z.string(),
  sector: z.string(),
  summary: z.string(),
  about: z.string(),
  built: z.array(z.string()),
  stack: z.array(z.string()),
  features: z.array(z.object({ title: z.string(), body: z.string() })),
  services: z.array(z.string()),
  /** Whether the site allows being shown in an iframe (checked at add time). */
  embeddable: z.boolean(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  media: z
    .object({
      desktop: z.string(),
      full: z.string().optional(),
      mobile: z.string().optional(),
      width: z.number(),
      height: z.number(),
      fullHeight: z.number().optional(),
    })
    .nullable(),
  addedAt: z.string(),
});

export type Project = z.infer<typeof projectSchema>;

export const projects: Project[] = z.array(projectSchema).parse(raw);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacentProject(slug: string): Project | undefined {
  if (projects.length < 2) return undefined;
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
