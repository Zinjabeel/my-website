import Link from "next/link";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { HeroShelf } from "@/components/shelf/HeroShelf";
import { ServicesList } from "@/components/home/ServicesList";
import { ProjectCard, ReservedCard } from "@/components/work/ProjectCard";
import { ButtonLink, SectionLabel } from "@/components/ui/primitives";
import { Reveal, ScrollWords, SplitWords } from "@/components/ui/motion";
import { projects } from "@/content/projects";
import { principles, stages } from "@/content/offer";
import { site } from "@/content/site";

export default function HomePage() {
  const featured = projects.slice(0, 3);
  return (
    <>
      <TopBar />

      {/* ── Hero ── */}
      <section aria-labelledby="hero-title" className="gutter pt-[4vh]">
        <h1 id="hero-title" className="display text-[clamp(3.4rem,11.6vw,13rem)]">
          <SplitWords text="Websites that" immediate delay={0.45} className="block" />
          <SplitWords text="keep working." immediate delay={0.6} className="block text-ink/35" />
        </h1>
        <div className="mt-8 grid gap-6 md:mt-12 md:grid-cols-12 md:items-end">
          <p className="label text-muted md:col-span-3">(01) Launchly — est. {site.yearsBuilding} years of launches</p>
          <p className="max-w-xl text-[clamp(1.1rem,1.5vw,1.35rem)] leading-snug md:col-span-6">
            We design and build websites for established companies — engineered to generate leads, rank in search and
            stay easy to run long after launch.
          </p>
          <div className="md:col-span-3 md:justify-self-end">
            <ButtonLink href="/contact" variant="ink">
              Start a project
            </ButtonLink>
          </div>
        </div>
        <div className="mt-10 md:mt-14">
          <HeroShelf />
        </div>
      </section>

      {/* ── Intro ── */}
      <section aria-label="Introduction" className="gutter py-28 md:py-44">
        <div className="grid gap-8 md:grid-cols-12">
          <SectionLabel index="02" className="md:col-span-3">
            Who we are
          </SectionLabel>
          <ScrollWords
            className="headline text-[clamp(1.9rem,4.2vw,4.25rem)] md:col-span-9"
            text="Launchly is a small team that builds websites for established companies in tech, media, construction and retail. Not just good-looking pages — complete systems that bring in leads, are easy to market and keep improving for years."
          />
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" aria-labelledby="services-title" className="gutter scroll-mt-8 pb-28 md:pb-44">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <SectionLabel index="03">Services</SectionLabel>
            <h2 id="services-title" className="display mt-5 text-[clamp(2.8rem,7.5vw,7.5rem)]">
              What we launch
            </h2>
          </div>
          <p className="max-w-sm text-muted">
            Everything a serious company website needs — designed, built and supported by the same team.
          </p>
        </div>
        <ServicesList />
      </section>

      {/* ── Featured work ── */}
      <section aria-labelledby="work-title" className="gutter pb-28 md:pb-44">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <SectionLabel index="04">Selected work</SectionLabel>
            <h2 id="work-title" className="display mt-5 text-[clamp(2.8rem,7.5vw,7.5rem)]">
              Recent launches
            </h2>
          </div>
          <ButtonLink href="/work" variant="ghost">
            All work
          </ButtonLink>
        </div>
        <div className="grid gap-x-4 gap-y-14 md:grid-cols-2">
          {featured.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.08}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
          <Reveal delay={0.1}>
            <ReservedCard />
          </Reveal>
        </div>
      </section>

      {/* ── Why Launchly ── */}
      <section aria-labelledby="why-title" className="bg-night py-28 text-paper md:py-40">
        <div className="gutter">
          <p className="label flex gap-3 text-fog">
            <span>(05)</span>
            <span>Why Launchly</span>
          </p>
          <div className="mt-8 grid gap-10 md:grid-cols-12 md:items-end">
            <h2 id="why-title" className="display text-[clamp(7rem,26vw,24rem)] leading-[0.75] text-signal md:col-span-7">
              12<span className="text-paper">mo</span>
            </h2>
            <p className="headline text-[clamp(1.6rem,3vw,2.75rem)] md:col-span-5">
              Touch-ups, changes and updates are included for the first 12 months. No extra charge.
            </p>
          </div>
          <ul className="mt-20 grid gap-px overflow-hidden rounded-[10px] bg-night-3 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.06} className="bg-night p-7 md:p-8">
                <p className="label text-fog">0{i + 1}</p>
                <h3 className="mt-10 text-[1.5rem] font-semibold tracking-[-0.03em]">{p.title}</h3>
                <p className="mt-3 text-[0.98rem] text-fog">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process teaser ── */}
      <section aria-labelledby="process-title" className="gutter py-28 md:py-44">
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <SectionLabel index="06">Process</SectionLabel>
            <h2 id="process-title" className="display mt-5 text-[clamp(2.8rem,7.5vw,7.5rem)]">
              Seven steps to lift-off
            </h2>
          </div>
          <ButtonLink href="/process" variant="ghost">
            Full process
          </ButtonLink>
        </div>
        <ol className="grid grid-cols-1 border-t hairline sm:grid-cols-2 lg:grid-cols-7">
          {stages.map((s, i) => (
            <Reveal
              as="li"
              key={s.id}
              delay={i * 0.05}
              className="group border-b hairline py-6 sm:pr-6 lg:min-h-[19rem] lg:border-b-0 lg:border-r lg:px-5 lg:py-8 lg:first:pl-0 lg:last:border-r-0"
            >
              <Link href={`/process#${s.id}`} className="flex h-full flex-col">
                <span className="display text-[3.25rem] text-ink/20 transition-colors duration-300 group-hover:text-signal">
                  {s.number}
                </span>
                <span className="mt-auto pt-6 text-[1.1rem] font-semibold leading-tight tracking-[-0.02em]">{s.title}</span>
                <span className="mt-1 text-[0.9rem] text-muted">{s.short}</span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>

      <CallToAction />
    </>
  );
}
