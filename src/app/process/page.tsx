import type { Metadata } from "next";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { SectionLabel } from "@/components/ui/primitives";
import { Reveal, SplitWords } from "@/components/ui/motion";
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
      <TopBar section="Process" />

      <section className="gutter pb-16 pt-[6vh] md:pb-28">
        <SectionLabel index="07">Stages</SectionLabel>
        <h1 className="display mt-6 text-[clamp(3.2rem,10vw,10.5rem)]">
          <SplitWords text="From first call" immediate delay={0.4} className="block" />
          <SplitWords text="to lift-off." immediate delay={0.55} className="block text-ink/35" />
        </h1>
        <p className="mt-10 max-w-xl text-[clamp(1.05rem,1.4vw,1.3rem)] leading-snug md:ml-[25%]">
          A clear, seven-stage process. You always know what&apos;s happening, what&apos;s next and what we need from you.
        </p>
      </section>

      {/* Countdown rail */}
      <nav aria-label="Stages" className="gutter sticky top-0 z-20 hidden bg-paper/95 py-3 backdrop-blur-sm md:block">
        <ol className="flex justify-between border-y hairline py-3">
          {stages.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="label text-muted transition-colors hover:text-ink">
                {s.number} {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ol className="gutter pb-24">
        {stages.map((s, i) => (
          <li key={s.id} id={s.id} className="scroll-mt-24 border-b hairline py-14 md:py-24">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="md:sticky md:top-28">
                  <p className="label text-muted">
                    Stage {s.number} / 0{stages.length}
                  </p>
                  <p
                    aria-hidden
                    className={`display mt-2 text-[clamp(6rem,17vw,16rem)] leading-[0.8] ${i === stages.length - 1 ? "text-signal" : "text-ink/[0.13]"}`}
                  >
                    {s.number}
                  </p>
                </div>
              </div>
              <Reveal className="md:col-span-7 md:pt-8">
                <h2 className="headline text-[clamp(2.2rem,4.6vw,4.25rem)]">{s.title}</h2>
                <p className="label mt-3 text-muted">{s.short}</p>
                <p className="mt-8 max-w-xl text-[1.15rem] leading-relaxed text-ink-2">{s.body}</p>
                <ul className="mt-8 flex flex-wrap gap-2" aria-label="Deliverables">
                  {s.deliverables.map((d) => (
                    <li key={d} className="label rounded-full border hairline bg-paper-2 px-3 py-2 text-ink-2">
                      {d}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="after-title" className="gutter pb-28">
        <div className="grid gap-8 rounded-[10px] bg-night p-8 text-paper md:grid-cols-12 md:p-14">
          <p className="label text-fog md:col-span-3">(After launch)</p>
          <div className="md:col-span-9">
            <h2 id="after-title" className="display text-[clamp(2.4rem,5.5vw,5.5rem)]">
              The first 12 months are on us.
            </h2>
            <p className="mt-6 max-w-xl text-[1.1rem] text-fog">
              Touch-ups, changes and updates are included for a full year after launch, at no extra charge — so your
              website keeps improving while you learn what your visitors need.
            </p>
          </div>
        </div>
      </section>

      <CallToAction />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Process", path: "/process" }])} />
    </>
  );
}
