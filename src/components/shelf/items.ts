import { projects, hostOf } from "@/content/projects";
import { services } from "@/content/offer";

export type ShelfChoice = { label: string; hint: string; href: string; external?: boolean };

export type ShelfItem = {
  id: string;
  code: string;
  title: string;
  kicker: string;
  /** Primary destination (used by the plain link list). */
  href: string;
  body: string;
  tags: string[];
  /** Small side notes shown around the case in the viewer. */
  notes: { label: string; value: string }[];
  choices: ShelfChoice[];
  image?: string;
  placeholder?: boolean;
  tone: "screen" | "ink" | "paper" | "signal";
};

/** Everything that sits on the hero shelf: projects first, a reserved slot, then services. */
export function buildShelfItems(): ShelfItem[] {
  const items: Omit<ShelfItem, "code">[] = [
    ...projects.map((p) => ({
      id: `work-${p.slug}`,
      title: p.name,
      kicker: `Case study — ${hostOf(p.url)}`,
      href: `/work/${p.slug}`,
      body: p.summary,
      tags: p.services,
      notes: [
        { label: "Sector", value: p.sector },
        { label: "Year", value: p.year },
        { label: "Stack", value: p.stack.slice(0, 3).join(" · ") },
        { label: "Live", value: hostOf(p.url) },
      ],
      choices: [
        { label: "Open the case study", hint: "Preview, what we built, tech", href: `/work/${p.slug}` },
        { label: "Visit the live site", hint: hostOf(p.url), href: p.url, external: true },
        { label: "Start a similar project", hint: "Tell us about yours", href: "/contact" },
      ],
      image: p.media?.desktop,
      placeholder: p.placeholder,
      tone: "screen" as const,
    })),
    {
      id: "reserved",
      title: "Your launch",
      kicker: "Reserved slot",
      href: "/contact",
      body: "This case on the shelf is kept empty for the next company we launch. Tell us what your website needs to do.",
      tags: ["Available"],
      notes: [
        { label: "Status", value: "Open" },
        { label: "Included", value: "12 months of care" },
        { label: "Clients", value: "Established companies" },
        { label: "Reply", value: "Personal" },
      ],
      choices: [
        { label: "Start a project", hint: "Send us a brief", href: "/contact" },
        { label: "See our work", hint: "Recent launches", href: "/work" },
        { label: "How we work", hint: "Seven stages", href: "/process" },
      ],
      tone: "signal" as const,
    },
    ...services.map((s, i) => ({
      id: `service-${s.id}`,
      title: s.title,
      kicker: "Service",
      href: `/services/${s.id}`,
      body: s.summary,
      tags: s.tags,
      notes: [
        { label: "Service", value: `S-${String(i + 1).padStart(2, "0")}` },
        ...s.tags.map((t, j) => ({ label: ["Focus", "Includes", "Built with"][j] ?? "Tag", value: t })),
      ],
      choices: [
        { label: "Explore this service", hint: "What's included", href: `/services/${s.id}` },
        { label: "See the process", hint: "From first call to launch", href: "/process" },
        { label: "Start a project", hint: "Talk to the team", href: "/contact" },
      ],
      tone: (s.id === "care" ? "signal" : i % 2 ? "paper" : "ink") as ShelfItem["tone"],
    })),
  ];
  return items.map((it, i) => ({ ...it, code: `L-${String(i + 1).padStart(2, "0")}` }));
}
