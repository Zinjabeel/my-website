import type { Metadata } from "next";
import { Check } from "lucide-react";
import { CallToAction } from "@/components/site/CallToAction";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ButtonLink, Eyebrow, PageHead } from "@/components/ui/primitives";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Website design and development, lead-focused pages, CMS, SEO foundations, marketing-ready builds and 12 months of care — from one team.",
  alternates: { canonical: "/services" },
  openGraph: { url: "/services", title: "Services — Launchly" },
};

const included = [
  "Pages planned around generating enquiries",
  "A CMS your team can use without a developer",
  "Technical SEO from the first line of code",
  "A setup that's ready for your marketing",
  "12 months of touch-ups, changes and updates",
];

export default function ServicesPage() {
  return (
    <>
      <PageHead
        eyebrow="Services"
        title="One team. The whole website."
        intro="Six services that fit together — because a website only works when design, code, content and search are planned as one thing."
      />

      <section aria-label="All services" className="wrap section">
        <ServicesGrid />
      </section>

      <section aria-labelledby="every-title" className="band-soft">
        <div className="wrap section grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>Every launch</Eyebrow>
            <h2 id="every-title" className="display h-section mt-5">
              Included, not extra.
            </h2>
            <p className="lead mt-5 max-w-md">Whatever the size of the project, every Launchly website ships with the same foundations.</p>
            <div className="mt-8">
              <ButtonLink href="/process" variant="outline">
                See how we work
              </ButtonLink>
            </div>
          </div>
          <ul className="md:col-span-6 md:col-start-7">
            {included.map((item) => (
              <li key={item} className="hairline flex items-center gap-4 border-b py-5 text-[1.1rem] font-medium first:border-t">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-signal text-signal-ink" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CallToAction title="Tell us what you need." />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])} />
    </>
  );
}
