import type { Metadata } from "next";
import { CallToAction } from "@/components/site/CallToAction";
import { Eyebrow, PageHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { stages } from "@/content/offer";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our Process",
  description:
    "How Launchly builds websites: discovery, research, architecture, design, development, testing and launch — with 12 months of support included.",
  alternates: { canonical: "/process" },
  openGraph: { url: "/process", title: "Our Process — Launchly" },
};

export default function ProcessPage() {
  return (
    <>
      <PageHead
        eyebrow="Our process"
        title="From first call to lift-off."
        intro="A clear, seven-step process. You always know what's happening, what's next and what we need from you."
      />

      {/* Step rail */}
      <nav aria-label="Steps" className="sticky top-[var(--header-h)] z-20 hidden border-b border-ink bg-paper lg:block">
        <ol className="wrap flex">
          {stages.map((s) => (
            <li key={s.id} className="flex-1 border-r hairline first:border-l">
              <a href={`#${s.id}`} className="flex h-12 items-center gap-2 px-3 text-[0.8125rem] font-semibold transition-colors hover:bg-ink hover:text-paper">
                <span className="label text-signal">{s.number}</span>
                <span className="truncate">{s.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="wrap pb-10">
        {stages.map((s, i) => (
          <li key={s.id} id={s.id} className="scroll-mt-32 border-b hairline py-12 md:py-20">
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-4">
                <p className="label text-muted">
                  Step {s.number} of 0{stages.length}
                </p>
                <p aria-hidden className={`display mt-3 text-[clamp(4.5rem,11vw,9rem)] !leading-[0.85] ${i === stages.length - 1 ? "text-signal" : "text-ink"}`}>
                  {s.number}
                </p>
              </div>
              <Reveal className="md:col-span-8 md:pt-3">
                <h2 className="display h-section">{s.title}</h2>
                <p className="eyebrow mt-4 text-muted">{s.short}</p>
                <p className="lead mt-6 max-w-2xl">{s.body}</p>
                <div className="mt-8">
                  <p className="label text-muted">You get</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {s.deliverables.map((d) => (
                      <li key={d} className="rounded-[4px] border-[1.5px] border-ink px-3 py-1.5 text-[0.9rem] font-semibold">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="after-title" className="wrap pb-20 md:pb-28">
        <div className="card card-hard grid gap-8 p-8 md:grid-cols-12 md:p-12">
          <div className="md:col-span-7">
            <Eyebrow>After launch</Eyebrow>
            <h2 id="after-title" className="display h-section mt-5">
              The first 12 months are on us.
            </h2>
          </div>
          <p className="lead md:col-span-5 md:self-end">
            Touch-ups, changes and updates are included for a full year after launch, at no extra charge — so your website keeps
            improving while you learn what your visitors need.
          </p>
        </div>
      </section>

      <CallToAction />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Process", path: "/process" }])} />
    </>
  );
}
