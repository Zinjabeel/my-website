import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/seo";
import { legalDocs } from "@/content/legal";
import { services } from "@/content/offer";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["/", "/work", "/services", "/process", "/about", "/contact", "/start"].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.8,
  }));
  const work = projects
    .filter((p) => !p.placeholder)
    .map((p) => ({ url: absoluteUrl(`/work/${p.slug}`), lastModified: new Date(p.addedAt), changeFrequency: "yearly" as const, priority: 0.7 }));
  const legal = ["/legal", ...legalDocs.map((d) => `/legal/${d.slug}`)].map((p) => ({
    url: absoluteUrl(p),
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));
  const svc = services.map((s) => ({
    url: absoluteUrl(`/services/${s.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...svc, ...work, ...legal];
}
