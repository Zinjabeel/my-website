import Link from "next/link";
import { site } from "@/content/site";
import { legalDocs } from "@/content/legal";
import { services } from "@/content/offer";
import { GiantWordmark, Wordmark } from "./Logo";

type Col = { title: string; links: { label: string; href: string; external?: boolean }[] };

export function Footer() {
  const year = new Date().getFullYear();
  const cols: Col[] = [
    {
      title: "Studio",
      links: [
        { label: "Our work", href: "/work" },
        { label: "Services", href: "/services" },
        { label: "Our process", href: "/process" },
        { label: "About Launchly", href: "/about" },
      ],
    },
    { title: "Services", links: services.map((s) => ({ label: s.title, href: `/services/${s.id}` })) },
    {
      title: "Get started",
      links: [
        { label: "Start a project", href: "/start" },
        { label: "Your account", href: "/account" },
        { label: "Contact us", href: "/contact" },
        ...(site.emailIsPlaceholder ? [] : [{ label: site.email, href: `mailto:${site.email}` }]),
        ...site.socials.map((s) => ({ ...s, external: true })),
      ],
    },
    { title: "Legal", links: legalDocs.map((d) => ({ label: d.title, href: `/legal/${d.slug}` })) },
  ];

  return (
    <footer className="band-soft mt-0">
      <div className="wrap pb-10 pt-16 md:pt-20">
        <div className="grid gap-10 border-b hairline pb-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Link href="/" aria-label="Launchly — home" className="inline-block text-[1.6rem]">
              <Wordmark />
            </Link>
            <p className="mt-5 max-w-xs text-[1.05rem] font-medium leading-snug">{site.tagline}</p>
            <p className="label mt-6 text-muted">{site.sectors.join(" · ")}</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 md:col-span-8 lg:grid-cols-4">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-5 space-y-2.5 text-[0.95rem] text-ink-2">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      {l.external || l.href.startsWith("mailto:") ? (
                        <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="transition-colors hover:text-signal">
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="transition-colors hover:text-signal">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 pt-6 text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="label">
            © {year} {site.legalName}. All rights reserved.
          </p>
          <p className="label">A small team — founded by {site.founder}</p>
        </div>

        <GiantWordmark className="mt-12 block h-auto w-full text-ink" />
      </div>
    </footer>
  );
}
