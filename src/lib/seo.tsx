import { site } from "@/content/site";
import type { Project } from "@/content/projects";
import { services } from "@/content/offer";

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    description: site.description,
    founder: { "@type": "Person", name: site.founder },
    knowsAbout: services.map((s) => s.title),
    areaServed: "Worldwide",
    ...(site.emailIsPlaceholder ? {} : { email: site.email }),
    ...(site.socials.length ? { sameAs: site.socials.map((s) => s.href) } : {}),
  };
}

export function projectJsonLd(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    url: absoluteUrl(`/work/${project.slug}`),
    about: project.about,
    dateCreated: project.year,
    creator: { "@id": `${site.url}/#organization` },
    ...(project.media ? { image: absoluteUrl(project.media.desktop) } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Renders JSON-LD safely (escapes `<` so content can never break out of the script tag). */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
