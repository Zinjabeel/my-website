import { projects, hostOf } from "@/content/projects";
import { services } from "@/content/offer";

export type ShelfItem = {
  id: string;
  code: string;
  title: string;
  kicker: string;
  href: string;
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
      image: p.media?.desktop,
      placeholder: p.placeholder,
      tone: "screen" as const,
    })),
    {
      id: "reserved",
      title: "Your launch",
      kicker: "Reserved slot",
      href: "/contact",
      tone: "signal" as const,
    },
    ...services.map((s, i) => ({
      id: `service-${s.id}`,
      title: s.title,
      kicker: "Service",
      href: "/#services",
      tone: (s.id === "care" ? "signal" : i % 2 ? "paper" : "ink") as ShelfItem["tone"],
    })),
  ];
  return items.map((it, i) => ({ ...it, code: `L-${String(i + 1).padStart(2, "0")}` }));
}
