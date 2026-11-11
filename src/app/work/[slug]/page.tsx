import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { ProjectPreview } from "@/components/work/ProjectPreview";
import { ButtonLink, PlaceholderBadge, SectionLabel, Tag } from "@/components/ui/primitives";
import { Reveal, SplitWords } from "@/components/ui/motion";
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
      <TopBar section="Case study" />

      <section className="gutter pt-[4vh]">
        <Link href="/work" className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-ink">
          <ArrowLeft className="size-3.5" aria-hidden /> All work
        </Link>
        {project.placeholder && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[10px] border border-signal/50 bg-signal/10 px-4 py-3">
            <PlaceholderBadge />
            <p className="text-[0.95rem]">
              This is an example entry for testing the portfolio. It is not a Launchly project — replace it in{" "}
              <code className="label">src/content/projects.json</code>.
            </p>
          </div>
        )}
        <h1 className="display mt-8 text-[clamp(3.6rem,13vw,14rem)]">
          <SplitWords text={project.name} immediate delay={0.4} />
        </h1>
        <p className="mt-6 max-w-2xl text-[clamp(1.1rem,1.6vw,1.45rem)] leading-snug">{project.summary}</p>

        <dl className="mt-12 grid grid-cols-2 border-t hairline md:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label} className="border-b hairline py-5 pr-4 md:border-b-0">
              <dt className="label text-muted">{m.label}</dt>
              <dd className="mt-2 font-medium">
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
      </section>

      <section aria-label="Website preview" className="gutter mt-6 md:mt-10">
        <ProjectPreview project={project} />
      </section>

      <section className="gutter py-24 md:py-36">
        <div className="grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionLabel index="01">About the website</SectionLabel>
          </Reveal>
          <Reveal className="md:col-span-8">
            <p className="headline text-[clamp(1.6rem,3vw,2.75rem)]">{project.about}</p>
          </Reveal>
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionLabel index="02">What we built</SectionLabel>
          </Reveal>
          <ol className="md:col-span-8">
            {project.built.map((b, i) => (
              <Reveal as="li" key={i} delay={i * 0.05} className="grid grid-cols-[3rem_1fr] border-t hairline py-5 text-[1.1rem]">
                <span className="label pt-1 text-muted">0{i + 1}</span>
                <span>{b}</span>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionLabel index="03">Technology</SectionLabel>
          </Reveal>
          <Reveal className="flex flex-wrap gap-2 md:col-span-8">
            {project.stack.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </Reveal>
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-4">
            <SectionLabel index="04">Key features</SectionLabel>
          </Reveal>
          <ul className="grid gap-px overflow-hidden rounded-[10px] bg-line sm:grid-cols-2 md:col-span-8">
            {project.features.map((f, i) => (
              <Reveal as="li" key={i} delay={i * 0.06} className="bg-paper-2 p-7">
                <p className="label text-muted">F{i + 1}</p>
                <h3 className="mt-8 text-[1.3rem] font-semibold tracking-[-0.025em]">{f.title}</h3>
                <p className="mt-2 text-muted">{f.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex flex-wrap gap-3 md:pl-[33.4%]">
          <ButtonLink href={project.url} external variant="ink" cursor="Visit">
            Visit the website
          </ButtonLink>
          <ButtonLink href="/contact" variant="ghost">
            Start a similar project
          </ButtonLink>
        </div>
      </section>

      {next ? (
        <section className="gutter pb-24">
          <Link href={`/work/${next.slug}`} className="group block border-t hairline pt-8" data-cursor="Next">
            <p className="label text-muted">Next project</p>
            <p className="display mt-4 text-[clamp(3rem,10vw,10rem)] transition-colors duration-300 group-hover:text-signal">
              {next.name}
            </p>
          </Link>
        </section>
      ) : null}

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
