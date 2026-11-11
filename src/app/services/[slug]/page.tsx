import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { ButtonLink, SectionLabel, Tag } from "@/components/ui/primitives";
import { Reveal, SplitWords } from "@/components/ui/motion";
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
      <TopBar section="Service" />

      <section className="gutter pb-16 pt-[4vh] md:pb-28">
        <Link href="/#services" className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden /> All services
        </Link>
        <div className="mt-10 flex items-center gap-3">
          <span className="label rounded-full bg-ink px-3 py-1.5 text-paper">{code}</span>
          <span className="label text-muted">Service</span>
        </div>
        <h1 className="display mt-6 max-w-[14ch] text-[clamp(3.2rem,9.5vw,10rem)]">
          <SplitWords text={s.title} immediate delay={0.35} />
        </h1>
        <div className="mt-10 grid gap-8 md:grid-cols-12">
          <p className="headline text-[clamp(1.4rem,2.4vw,2.2rem)] md:col-span-7">{s.summary}</p>
          <div className="flex flex-wrap content-start gap-2 md:col-span-4 md:col-start-9">
            {s.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="included-title" className="bg-night py-24 text-paper md:py-36">
        <div className="gutter grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="label text-fog">(01) What&apos;s included</p>
            <h2 id="included-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5.5rem)]">
              What you get
            </h2>
            <p className="mt-6 max-w-md text-fog">{s.detail}</p>
          </div>
          <ol className="md:col-span-6 md:col-start-7">
            {s.included.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={i * 0.06}
                className="flex items-start gap-5 border-t border-night-3 py-6 last:border-b"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-signal text-signal-ink" aria-hidden>
                  <Check className="size-4" />
                </span>
                <span className="pt-1 text-[1.15rem]">{item}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="fit-title" className="gutter py-24 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <SectionLabel index="02" className="md:col-span-3">
            Is it for you?
          </SectionLabel>
          <div className="md:col-span-9">
            <h2 id="fit-title" className="headline text-[clamp(1.9rem,4vw,3.75rem)]">
              {s.fit}
            </h2>
            <p className="mt-8 max-w-xl text-[1.1rem] text-ink-2">
              Every Launchly website comes with touch-ups, changes and updates for the first 12 months at no extra charge.
            </p>
          </div>
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <SectionLabel index="03" className="md:col-span-3">
            How it runs
          </SectionLabel>
          <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-line sm:grid-cols-4 md:col-span-9 lg:grid-cols-7">
            {stages.map((st) => (
              <li key={st.id} className="bg-paper-2 p-4">
                <Link href={`/process#${st.id}`} className="group block">
                  <span className="display text-[2rem] text-ink/20 transition-colors group-hover:text-signal">{st.number}</span>
                  <span className="mt-6 block text-[0.9rem] font-semibold leading-tight">{st.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-20 flex flex-wrap gap-3 md:pl-[25%]">
          <ButtonLink href="/contact" variant="ink">
            Discuss this service
          </ButtonLink>
          <ButtonLink href="/work" variant="ghost">
            See our work
          </ButtonLink>
        </div>
      </section>

      <section className="gutter pb-24">
        <Link href={`/services/${next.id}`} className="group block border-t hairline pt-8" data-cursor="Next service">
          <p className="label text-muted">Next service</p>
          <p className="display mt-4 text-[clamp(2.6rem,8vw,8rem)] transition-colors duration-300 group-hover:text-signal">
            {next.title}
          </p>
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
          { name: s.title, path: `/services/${s.id}` },
        ])}
      />
    </>
  );
}
