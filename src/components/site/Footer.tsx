import Link from "next/link";
import { site } from "@/content/site";
import { legalDocs } from "@/content/legal";
import { LogoMark } from "./Logo";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-paper pb-[calc(var(--dock-h)+2.5rem)] pt-24 text-ink">
      <div className="gutter">
        <div className="grid gap-12 border-t hairline pt-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label text-muted">(Launchly)</p>
            <p className="headline mt-4 max-w-md text-[clamp(1.75rem,3.2vw,2.75rem)]">
              Websites for established companies — built to convert, rank and keep working.
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
            <p className="label text-muted">Index</p>
            <ul className="mt-4 space-y-2 text-[0.95rem]">
              {[{ href: "/", label: "Home" }, ...site.nav].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-2">
            <p className="label text-muted">Contact</p>
            <ul className="mt-4 space-y-2 text-[0.95rem]">
              <li>
                <Link href="/contact" className="link-underline">
                  Start a project
                </Link>
              </li>
              {!site.emailIsPlaceholder && (
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline">
                    {site.email}
                  </a>
                </li>
              )}
              {site.socials.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label text-muted">Sectors</p>
            <ul className="mt-4 space-y-2 text-[0.95rem] text-ink-2">
              {site.sectors.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>

        <nav aria-label="Legal" className="mt-20">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalDocs.map((d) => (
              <li key={d.slug}>
                <Link href={`/legal/${d.slug}`} className="label text-ink-2 transition-colors hover:text-ink">
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col gap-3 text-muted sm:flex-row sm:items-end sm:justify-between">
          <p className="label">© {year} {site.legalName}. All rights reserved.</p>
          <p className="label">
            A small team, est. {year - site.yearsBuilding} — founded by {site.founder}
          </p>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none mt-8 select-none px-[calc(var(--gutter)*0.5)]">
        <div className="display flex items-end gap-[0.06em] text-[clamp(4.5rem,22.5vw,24rem)] leading-[0.74] text-ink">
          <LogoMark className="h-[0.7em] w-[0.7em] shrink-0 translate-y-[-0.02em]" />
          <span>Launchly</span>
        </div>
      </div>
    </footer>
  );
}
