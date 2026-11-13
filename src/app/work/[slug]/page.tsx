import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { CallToAction } from "@/components/site/CallToAction";
import { ProjectPreview } from "@/components/work/ProjectPreview";
import { ButtonLink, Eyebrow, PlaceholderBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { getAdjacentProject, getProject, hostOf, projects } from "@/content/projects";
import { breadcrumbJsonLd, JsonLd, projectJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — Case study`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      url: `/work/${project.slug}`,
      title: `${project.name} — Launchly case study`,
      description: project.summary,
      images: project.media ? [{ url: project.media.desktop, width: 1440, height: 900 }] : undefined,
    },
  };
}

function Block({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 border-t hairline py-12 md:grid-cols-12 md:py-16">
      <div className="md:col-span-4">
        <p className="label text-muted">{index}</p>
        <h2 className="h-card mt-2">{label}</h2>
      </div>
      <div className="md:col-span-8">{children}</div>
    </div>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getAdjacentProject(slug);

  const meta = [
    { label: "Sector", value: project.sector },
    { label: "Year", value: project.year },
    { label: "Services", value: project.services.join(", ") },
    { label: "Website", value: hostOf(project.url), href: project.url },
  ];

  return (
    <>
      <header>
        <div className="wrap pb-10 pt-10 md:pt-14">
          <Link href="/work" className="eyebrow inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
            <ArrowLeft className="size-3.5" aria-hidden /> All work
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="tag">Case study</span>
            <span className="tag tag-outline">{project.sector}</span>
            {project.placeholder && <PlaceholderBadge />}
          </div>
          <h1 className="display h-page mt-5 max-w-[16ch]">{project.name}</h1>
          <p className="lead mt-6 max-w-2xl">{project.summary}</p>
        </div>
        <div className="border-y-[1.5px] border-ink">
          <dl className="wrap grid grid-cols-2 md:grid-cols-4">
            {meta.map((m, i) => (
              <div
                key={m.label}
                className={`hairline py-5 ${["pr-4", "border-l pl-4 md:px-6", "border-t pr-4 md:border-l md:border-t-0 md:px-6", "border-l border-t pl-4 md:border-t-0 md:px-6"][i]}`}
              >
                <dt className="label text-muted">{m.label}</dt>
                <dd className="mt-1.5 font-semibold">
                  {m.href ? (
                    <a href={m.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {m.value}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    m.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section aria-label="Website preview" className="wrap pt-10 md:pt-14">
        <ProjectPreview project={project} />
      </section>

      <section className="wrap pb-8 pt-16 md:pt-24">
        <Block index="01" label="About the website">
          <p className="max-w-3xl text-[clamp(1.2rem,1.9vw,1.6rem)] font-medium leading-snug">{project.about}</p>
        </Block>

        <Block index="02" label="What we built">
          <ul className="grid gap-x-10 sm:grid-cols-2">
            {project.built.map((b, i) => (
              <Reveal as="li" key={i} className="flex gap-3.5 border-b hairline py-4 text-[1.02rem]">
                <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-ink text-paper" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {b}
              </Reveal>
            ))}
          </ul>
        </Block>

        {project.features.length > 0 && (
          <Block index="03" label="Key features">
            <ul className="grid gap-5 sm:grid-cols-2">
              {project.features.map((f, i) => (
                <Reveal as="li" key={i} delay={(i % 2) * 0.05} className="card p-6">
                  <p className="label text-signal">F-{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="h-card mt-6 !text-[1.2rem]">{f.title}</h3>
                  <p className="mt-2.5 text-[0.975rem] text-ink-2">{f.body}</p>
                </Reveal>
              ))}
            </ul>
          </Block>
        )}

        <Block index="04" label="Technology">
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <li key={s} className="rounded-[4px] border-[1.5px] border-ink px-3 py-1.5 text-[0.9rem] font-semibold">
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href={project.url} external variant="primary">
              Visit the website
            </ButtonLink>
            <ButtonLink href="/start" variant="outline">
              Start a similar project
            </ButtonLink>
          </div>
        </Block>
      </section>

      {next && (
        <section className="wrap pb-20">
          <Link href={`/work/${next.slug}`} className="group flex items-end justify-between gap-6 border-t-[1.5px] border-ink pt-8">
            <span>
              <Eyebrow>Next project</Eyebrow>
              <span className="display mt-4 block text-[clamp(2rem,5vw,4rem)] transition-colors group-hover:text-signal">{next.name}</span>
            </span>
            <ArrowRight className="mb-3 size-8 shrink-0 transition-transform duration-300 group-hover:translate-x-2" aria-hidden />
          </Link>
        </section>
      )}

      <CallToAction />
      <JsonLd data={projectJsonLd(project)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Work", path: "/work" },
          { name: project.name, path: `/work/${project.slug}` },
        ])}
      />
    </>
  );
}
