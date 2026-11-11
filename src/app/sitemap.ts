import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["/", "/work", "/about", "/process", "/contact"].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  const work = projects
    .filter((p) => !p.placeholder)
    .map((p) => ({ url: absoluteUrl(`/work/${p.slug}`), lastModified: new Date(p.addedAt), changeFrequency: "yearly" as const, priority: 0.7 }));
  return [...pages, ...work];
}
