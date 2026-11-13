import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { hostOf, type Project } from "@/content/projects";
import { PlaceholderBadge } from "@/components/ui/primitives";

/** Browser-framed screenshot. On hover the full page scrolls inside the frame. */
export function ProjectShot({ project, priority = false, sizes }: { project: Project; priority?: boolean; sizes: string }) {
  const m = project.media;
  return (
    <div className="card card-hard overflow-hidden bg-night">
      <div className="flex items-center gap-3 border-b border-night-3 bg-night-2 px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-night-3" />
          <span className="size-2.5 rounded-full bg-night-3" />
          <span className="size-2.5 rounded-full bg-night-3" />
        </span>
        <span className="label flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded bg-night px-3 py-1 text-fog">
          <Lock className="size-3 shrink-0" aria-hidden />
          <span className="truncate normal-case">{hostOf(project.url)}</span>
        </span>
        <span className="w-10" aria-hidden />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-night-2 [container-type:size]">
        {m?.full && m.fullHeight ? (
          <Image
            src={m.full}
            alt={`Screenshot of the ${project.name} website`}
            width={1440}
            height={m.fullHeight}
            priority={priority}
            sizes={sizes}
            className="scroll-shot absolute left-0 top-0 h-auto w-full"
          />
        ) : m ? (
          <Image src={m.desktop} alt={`Screenshot of the ${project.name} website`} fill priority={priority} sizes={sizes} className="object-cover object-top" />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <span className="display text-[clamp(1.6rem,4vw,3rem)] text-paper">{project.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Project presented as a feature row: large framed preview beside the essentials. */
export function ProjectFeature({ project, priority = false, index = 0 }: { project: Project; priority?: boolean; index?: number }) {
  return (
    <article className="group grid gap-8 md:grid-cols-12 md:items-center md:gap-12">
      <Link
        href={`/work/${project.slug}`}
        aria-label={`${project.name} — view case study`}
        className={`block md:col-span-7 ${index % 2 ? "md:order-2" : ""}`}
      >
        <ProjectShot project={project} priority={priority} sizes="(max-width: 768px) 92vw, 56vw" />
      </Link>
      <div className="md:col-span-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag">{project.sector}</span>
          <span className="tag tag-outline">{project.year}</span>
          {project.placeholder && <PlaceholderBadge />}
        </div>
        <h3 className="display mt-5 text-[clamp(1.9rem,3.4vw,3rem)]">
          <Link href={`/work/${project.slug}`} className="transition-colors hover:text-signal">
            {project.name}
          </Link>
        </h3>
        <p className="lead mt-4">{project.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Services">
          {project.services.map((s) => (
            <li key={s} className="tag tag-outline">
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link href={`/work/${project.slug}`} className="btn btn-primary">
            Read the case study <ArrowRight className="size-4" aria-hidden />
          </Link>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 text-[0.9rem] font-semibold">
            {hostOf(project.url)} <ArrowUpRight className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** The open slot that invites the next client. Also the portfolio's empty state. */
export function ReservedCard() {
  return (
    <Link
      href="/start"
      className="card card-link group grid gap-6 border-dashed bg-transparent p-7 md:grid-cols-12 md:items-center md:p-10"
    >
      <div className="md:col-span-8">
        <span className="tag tag-ink">Reserved slot</span>
        <p className="display mt-5 text-[clamp(1.9rem,3.4vw,3rem)]">Your launch goes here.</p>
        <p className="lead mt-3 max-w-xl">This space is kept for the next company we launch. Send a brief and we&apos;ll show you how we&apos;d approach it.</p>
      </div>
      <div className="md:col-span-4 md:justify-self-end">
        <span className="btn btn-outline group-hover:bg-ink group-hover:text-paper">
          Start a project <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
