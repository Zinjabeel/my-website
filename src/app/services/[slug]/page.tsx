import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CallToAction } from "@/components/site/CallToAction";
import { ButtonLink, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { services, stages } from "@/content/offer";
import { breadcrumbJsonLd, JsonLd, absoluteUrl } from "@/lib/seo";
import { site } from "@/content/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = services.find((x) => x.id === slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.summary,
    alternates: { canonical: `/services/${s.id}` },
    openGraph: { url: `/services/${s.id}`, title: `${s.title} — Launchly`, description: s.summary },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const index = services.findIndex((x) => x.id === slug);
  const s = services[index];
  if (!s) notFound();
  const next = services[(index + 1) % services.length];
  const code = `S-${String(index + 1).padStart(2, "0")}`;

  return (
    <>
      <header className="border-b hairline">
        <div className="wrap pb-12 pt-10 md:pb-16 md:pt-14">
          <Link href="/services" className="eyebrow inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
            <ArrowLeft className="size-3.5" aria-hidden /> All services
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="tag">Service</span>
            <span className="tag tag-outline">{code}</span>
          </div>
          <h1 className="display h-page mt-5 max-w-[15ch]">{s.title}</h1>
          <div className="mt-7 grid gap-8 md:grid-cols-12">
            <p className="lead md:col-span-7">{s.summary}</p>
            <ul className="flex flex-wrap content-start gap-2 md:col-span-4 md:col-start-9" aria-label="Focus areas">
              {s.tags.map((t) => (
                <li key={t} className="tag tag-outline">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <section aria-labelledby="included-title" className="band-ink">
        <div className="wrap section grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow className="text-fog">What&apos;s included</Eyebrow>
            <h2 id="included-title" className="display h-section mt-5">
              What you get.
            </h2>
            <p className="lead mt-5 max-w-md">{s.detail}</p>
          </div>
          <ol className="md:col-span-6 md:col-start-7">
            {s.included.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 0.04} className="flex items-start gap-4 border-b border-night-3 py-5 text-[1.1rem] first:border-t">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-signal text-signal-ink" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {item}
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="fit-title" className="wrap section">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow>Is it for you?</Eyebrow>
          </div>
          <div className="md:col-span-8">
            <h2 id="fit-title" className="display text-[clamp(1.6rem,3vw,2.6rem)] !leading-[1.08]">
              {s.fit}
            </h2>
            <p className="lead mt-6 max-w-xl">
              Every Launchly website comes with touch-ups, changes and updates for the first 12 months at no extra charge.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/start" variant="primary">
                Start a project
              </ButtonLink>
              <ButtonLink href="/work" variant="outline">
                See our work
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <Eyebrow>How it runs</Eyebrow>
            <p className="mt-4 max-w-xs text-muted">The same seven steps on every project.</p>
          </div>
          <ol className="grid grid-cols-2 overflow-hidden rounded-[8px] border-[1.5px] border-ink sm:grid-cols-4 md:col-span-8 lg:grid-cols-7">
            {stages.map((st) => (
              <li key={st.id} className="border-b border-r hairline">
                <Link href={`/process#${st.id}`} className="group flex h-full flex-col p-4 transition-colors hover:bg-ink hover:text-paper">
                  <span className="label text-muted group-hover:text-signal">{st.number}</span>
                  <span className="mt-8 text-[0.9rem] font-bold leading-tight">{st.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap pb-20">
        <Link href={`/services/${next.id}`} className="group flex items-end justify-between gap-6 border-t-[1.5px] border-ink pt-8">
          <span>
            <Eyebrow>Next service</Eyebrow>
            <span className="display mt-4 block text-[clamp(1.9rem,4.6vw,3.75rem)] transition-colors group-hover:text-signal">{next.title}</span>
          </span>
          <ArrowRight className="mb-3 size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-2" aria-hidden />
        </Link>
      </section>

      <CallToAction />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.detail,
          url: absoluteUrl(`/services/${s.id}`),
          provider: { "@type": "ProfessionalService", name: site.name, url: site.url },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: s.title, path: `/services/${s.id}` },
        ])}
      />
    </>
  );
}
