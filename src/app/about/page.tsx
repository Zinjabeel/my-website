import type { Metadata } from "next";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { SectionLabel } from "@/components/ui/primitives";
import { Reveal, ScrollWords, SplitWords } from "@/components/ui/motion";
import { principles } from "@/content/offer";
import { site } from "@/content/site";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "Launchly is a small website development team building conversion-focused, SEO-ready websites for established companies.",
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", title: "About — Launchly" },
};

const approach = [
  {
    title: "Business first",
    body: "Before we design anything we learn how your company wins work. The website is built around that, not around a template.",
  },
  {
    title: "One team, start to finish",
    body: "The people who plan your website also design it, build it and support it. Nothing gets lost between handovers.",
  },
  {
    title: "Systems, not pages",
    body: "A CMS, SEO foundations and marketing-ready templates mean the site keeps growing with you instead of freezing at launch.",
  },
];

export default function AboutPage() {
  return (
    <>
      <TopBar section="About" />

      <section className="gutter pb-20 pt-[6vh] md:pb-32">
        <SectionLabel index="01">About Launchly</SectionLabel>
        <h1 className="display mt-6 text-[clamp(3.2rem,9.5vw,10rem)]">
          <SplitWords text="A small team" immediate delay={0.4} className="block" />
          <SplitWords text="with a long view." immediate delay={0.55} className="block text-ink/35" />
        </h1>
      </section>

      <section aria-labelledby="who-title" className="gutter pb-28 md:pb-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <SectionLabel index="02">Who we are</SectionLabel>
            <h2 id="who-title" className="sr-only">
              Who we are
            </h2>
          </div>
          <ScrollWords
            className="headline text-[clamp(1.8rem,3.8vw,3.75rem)] md:col-span-9"
            text={`We've spent the last ${site.yearsBuilding} years designing and developing websites. Today Launchly is a small, focused team working mostly with established companies in tech, news and media, construction and retail — businesses that need their website to do real work.`}
          />
        </div>
        <dl className="mt-20 grid grid-cols-2 border-t hairline md:grid-cols-4">
          {[
            { k: "Building websites", v: `${site.yearsBuilding} years` },
            { k: "Team", v: "Small & focused" },
            { k: "Clients", v: "Established companies" },
            { k: "Included care", v: "12 months" },
          ].map((s) => (
            <div key={s.k} className="border-b hairline py-6 pr-4 md:border-b-0">
              <dt className="label text-muted">{s.k}</dt>
              <dd className="headline mt-3 text-[clamp(1.4rem,2.4vw,2.2rem)]">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="believe-title" className="bg-night py-28 text-paper md:py-40">
        <div className="gutter">
          <p className="label flex gap-3 text-fog">
            <span>(03)</span>
            <span>What we believe</span>
          </p>
          <h2 id="believe-title" className="display mt-6 max-w-5xl text-[clamp(2.6rem,6.5vw,6.5rem)]">
            A website should earn its keep.
          </h2>
          <p className="mt-8 max-w-2xl text-[1.15rem] text-fog">
            Too many company websites look good on launch day and quietly stop working soon after: hard to update,
            invisible in search, and not built to turn visitors into customers. Launchly exists to build the opposite.
          </p>
          <ul className="mt-16 grid gap-px overflow-hidden rounded-[10px] bg-night-3 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06} className="bg-night p-8 md:p-10">
                <p className="label text-signal">0{i + 1}</p>
                <h3 className="mt-8 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.03em]">{p.title}</h3>
                <p className="mt-3 max-w-md text-fog">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="approach-title" className="gutter py-28 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionLabel index="04">Our approach</SectionLabel>
            <h2 id="approach-title" className="display mt-6 text-[clamp(2.6rem,5.5vw,5.25rem)]">
              How we work
            </h2>
          </div>
          <ol className="md:col-span-8">
            {approach.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 0.06} className="grid gap-4 border-t hairline py-8 md:grid-cols-[4rem_1fr_1.4fr]">
                <span className="label pt-1.5 text-muted">0{i + 1}</span>
                <h3 className="text-[1.5rem] font-semibold tracking-[-0.03em]">{a.title}</h3>
                <p className="text-muted">{a.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Founder" className="gutter pb-28 md:pb-40">
        <div className="grid gap-6 border-t hairline pt-10 md:grid-cols-12">
          <p className="label text-muted md:col-span-3">(05) The people</p>
          <p className="max-w-2xl text-[clamp(1.1rem,1.6vw,1.4rem)] leading-snug md:col-span-9">
            Launchly is run by a small team. We keep it deliberately compact, so every client works directly with the
            people building their website.
          </p>
          <p className="label text-muted md:col-span-9 md:col-start-4">— Founded by {site.founder}</p>
        </div>
      </section>

      <CallToAction />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}
