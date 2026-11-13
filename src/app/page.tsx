import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { CallToAction } from "@/components/site/CallToAction";
import { HeroShelf } from "@/components/shelf/HeroShelf";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FaqList } from "@/components/home/FaqList";
import { ProjectFeature, ProjectShot, ReservedCard } from "@/components/work/ProjectCard";
import { ButtonLink, Eyebrow, SectionHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { projects } from "@/content/projects";
import { faqs, principles, services, stages } from "@/content/offer";
import { site } from "@/content/site";
import { faqJsonLd, JsonLd } from "@/lib/seo";

export default function HomePage() {
  const latest = projects[0];
  const facts = [
    { value: `${site.yearsBuilding} yrs`, label: "Designing and building websites" },
    { value: "12 mo", label: "Of changes and updates included" },
    { value: String(services.length), label: "Services under one roof" },
    { value: String(stages.length), label: "Clear steps from brief to launch" },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section aria-labelledby="hero-title">
        <div className="wrap grid gap-12 pb-14 pt-12 md:pb-20 md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <Eyebrow>Website development studio</Eyebrow>
            <h1 id="hero-title" className="display h-hero mt-6">
              Websites that
              <br />
              keep working.
            </h1>
            <p className="lead mt-7 max-w-xl">
              We design and build websites for established companies — engineered to bring in leads, rank in search and stay
              easy to run long after launch.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/start" variant="signal">
                Start a project
              </ButtonLink>
              <ButtonLink href="/work" variant="outline">
                See our work
              </ButtonLink>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2 text-[0.9rem] font-medium text-ink-2">
              {["CMS on every website", "SEO built in from day one", "12 months of care included"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check className="size-4 text-signal" strokeWidth={3} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {latest && (
            <figure className="lg:col-span-5">
              <Link href={`/work/${latest.slug}`} className="group block" aria-label={`Latest launch: ${latest.name} — view case study`}>
                <ProjectShot project={latest} priority sizes="(max-width: 1024px) 92vw, 40vw" />
              </Link>
              <figcaption className="mt-5 flex items-center justify-between gap-4">
                <span className="flex items-center gap-3">
                  <span className="tag">Latest launch</span>
                  <span className="text-[0.95rem] font-semibold">{latest.name}</span>
                </span>
                <Link href={`/work/${latest.slug}`} className="link-underline inline-flex items-center gap-1 text-[0.875rem] font-semibold">
                  Case study <ArrowUpRight className="size-3.5" aria-hidden />
                </Link>
              </figcaption>
            </figure>
          )}
        </div>

        <div className="border-y-[1.5px] border-ink">
          <dl className="wrap grid grid-cols-2 lg:grid-cols-4">
            {facts.map((f, i) => (
              <div
                key={f.label}
                className={`hairline flex flex-col-reverse gap-2 py-6 md:py-8 ${
                  ["pr-5", "border-l pl-5 lg:px-7", "border-t pr-5 lg:border-l lg:border-t-0 lg:px-7", "border-l border-t pl-5 lg:border-t-0 lg:px-7"][i]
                }`}
              >
                <dt className="text-[0.9rem] text-muted">{f.label}</dt>
                <dd className="display text-[clamp(2rem,3.6vw,3.25rem)]">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── The Launch Archive ── */}
      <section aria-labelledby="archive-title" className="band-ink">
        <div className="wrap section">
          <div className="mb-10 grid gap-6 md:mb-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <Eyebrow className="text-fog">The Launch Archive</Eyebrow>
              <h2 id="archive-title" className="display h-section mt-5">
                Pull a case off the shelf.
              </h2>
            </div>
            <p className="lead md:col-span-5">
              Our work and services, filed like tapes in a video store. Look around, pick one up and open it to see what&apos;s
              inside.
            </p>
          </div>
          <HeroShelf />
        </div>
      </section>

      {/* ── Work ── */}
      <section aria-labelledby="work-title" className="wrap section">
        <SectionHead
          id="work-title"
          eyebrow="Selected work"
          title="Recent launches"
          action={
            <ButtonLink href="/work" variant="outline" size="sm">
              All work
            </ButtonLink>
          }
        />
        <div className="space-y-16 md:space-y-24">
          {projects.slice(0, 2).map((p, i) => (
            <Reveal key={p.slug}>
              <ProjectFeature project={p} index={i} />
            </Reveal>
          ))}
          <Reveal>
            <ReservedCard />
          </Reveal>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" aria-labelledby="services-title" className="band-soft">
        <div className="wrap section">
          <SectionHead
            id="services-title"
            eyebrow="Services"
            title="Everything a serious company website needs."
            intro="Designed, built and supported by the same team — so nothing gets lost between strategy, design and code."
            action={
              <ButtonLink href="/services" variant="outline" size="sm">
                All services
              </ButtonLink>
            }
          />
          <ServicesGrid />
        </div>
      </section>

      {/* ── Why Launchly ── */}
      <section aria-labelledby="why-title" className="band-ink">
        <div className="wrap section grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow className="text-fog">Why Launchly</Eyebrow>
            <h2 id="why-title" className="display mt-6 text-[clamp(2.9rem,5.6vw,5rem)]">
              <span className="text-signal">12 months</span>
              <br />
              included.
            </h2>
            <p className="lead mt-6 max-w-md">
              Touch-ups, changes and updates for the first 12 months after launch — at no extra charge. Launch is the start,
              not the finish.
            </p>
            <div className="mt-8">
              <ButtonLink href="/services/care" variant="outline">
                How care works
              </ButtonLink>
            </div>
          </div>
          <ul className="grid gap-px self-start overflow-hidden rounded-[8px] border-[1.5px] border-night-3 bg-night-3 sm:grid-cols-2 lg:col-span-7">
            {principles.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 2) * 0.05} className="bg-night p-7 md:p-8">
                <p className="label text-signal">0{i + 1}</p>
                <h3 className="h-card mt-7">{p.title}</h3>
                <p className="mt-3 text-[0.975rem] text-fog">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Process ── */}
      <section aria-labelledby="process-title" className="wrap section">
        <SectionHead
          id="process-title"
          eyebrow="Process"
          title="Seven steps to lift-off."
          intro="You always know what's happening, what's next and what we need from you."
          action={
            <ButtonLink href="/process" variant="outline" size="sm">
              Full process
            </ButtonLink>
          }
        />
        <ol className="grid overflow-hidden rounded-[8px] border-[1.5px] border-ink sm:grid-cols-2 lg:grid-cols-7">
          {stages.map((s) => (
            <li key={s.id} className="group border-b hairline last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0">
              <Link href={`/process#${s.id}`} className="flex h-full flex-col p-5 transition-colors hover:bg-ink hover:text-paper lg:min-h-[13.5rem]">
                <span className="label text-muted transition-colors group-hover:text-signal">Step {s.number}</span>
                <span className="h-card mt-auto pt-8 !text-[1.1rem]">{s.title}</span>
                <span className="mt-1.5 text-[0.875rem] text-muted transition-colors group-hover:text-fog">{s.short}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-title" className="band-soft">
        <div className="wrap section grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Questions</Eyebrow>
            <h2 id="faq-title" className="display h-section mt-5">
              Good to know.
            </h2>
            <p className="lead mt-5">
              Something else on your mind?{" "}
              <Link href="/contact" className="link-underline font-semibold text-ink">
                Ask us directly
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-8">
            <FaqList items={faqs} />
          </div>
        </div>
      </section>

      <CallToAction />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
