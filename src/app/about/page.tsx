import type { Metadata } from "next";
import { CallToAction } from "@/components/site/CallToAction";
import { ButtonLink, Eyebrow, PageHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
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
  const facts = [
    { k: "Building websites", v: `${site.yearsBuilding} years` },
    { k: "Team", v: "Small and focused" },
    { k: "Clients", v: "Established companies" },
    { k: "Included care", v: "12 months" },
  ];
  return (
    <>
      <PageHead
        eyebrow="About Launchly"
        title="A small team with a long view."
        intro={`We've spent the last ${site.yearsBuilding} years designing and developing websites. Today Launchly works mostly with established companies in tech, news and media, construction and retail — businesses that need their website to do real work.`}
      />

      <section aria-label="Launchly in short" className="border-b-[1.5px] border-ink">
        <dl className="wrap grid grid-cols-2 md:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.k}
              className={`hairline py-7 ${["pr-4", "border-l pl-4 md:px-6", "border-t pr-4 md:border-l md:border-t-0 md:px-6", "border-l border-t pl-4 md:border-t-0 md:px-6"][i]}`}
            >
              <dt className="label text-muted">{f.k}</dt>
              <dd className="h-card mt-2">{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="believe-title" className="wrap section">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>What we believe</Eyebrow>
            <h2 id="believe-title" className="display h-section mt-5">
              A website should earn its keep.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="lead">
              Too many company websites look good on launch day and quietly stop working soon after: hard to update, invisible in
              search, and not built to turn visitors into customers.
            </p>
            <p className="lead mt-5">Launchly exists to build the opposite — websites that keep bringing in work, year after year.</p>
          </div>
        </div>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <Reveal as="li" key={p.id} delay={(i % 4) * 0.04} className="card p-6">
              <p className="label text-signal">0{i + 1}</p>
              <h3 className="h-card mt-7 !text-[1.2rem]">{p.title}</h3>
              <p className="mt-2.5 text-[0.975rem] text-ink-2">{p.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="approach-title" className="band-ink">
        <div className="wrap section grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow className="text-fog">Our approach</Eyebrow>
            <h2 id="approach-title" className="display h-section mt-5">
              How we work.
            </h2>
            <div className="mt-8">
              <ButtonLink href="/process" variant="outline">
                The full process
              </ButtonLink>
            </div>
          </div>
          <ol className="md:col-span-6 md:col-start-7">
            {approach.map((a, i) => (
              <Reveal as="li" key={a.title} delay={i * 0.05} className="grid grid-cols-[3rem_1fr] border-b border-night-3 py-7 first:border-t">
                <span className="label pt-1.5 text-signal">0{i + 1}</span>
                <div>
                  <h3 className="h-card">{a.title}</h3>
                  <p className="mt-2 text-fog">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="people-title" className="wrap section">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <Eyebrow>The people</Eyebrow>
            <h2 id="people-title" className="display h-section mt-5">
              Deliberately compact.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="lead">
              Launchly is run by a small team. We keep it that way on purpose, so every client works directly with the people
              building their website.
            </p>
            <p className="label mt-8 border-t hairline pt-5 text-muted">Founded by {site.founder}</p>
          </div>
        </div>
      </section>

      <CallToAction />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}
