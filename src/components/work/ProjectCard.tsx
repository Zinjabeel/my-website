import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { hostOf, type Project } from "@/content/projects";
import { PlaceholderBadge } from "@/components/ui/primitives";

/** Large framed project card: the site sits inside a dark stage, caption underneath. */
export function ProjectCard({ project, priority = false, index }: { project: Project; priority?: boolean; index?: number }) {
  return (
    <article className="group">
      <Link href={`/work/${project.slug}`} data-cursor="Explore" className="block" aria-label={`${project.name} — view case study`}>
        <div
          className="relative overflow-hidden rounded-[10px] bg-night p-[6%] transition-colors duration-500"
          style={{ ["--accent" as string]: project.accent ?? "#ff5b1f" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{ background: "radial-gradient(70% 60% at 50% 100%, color-mix(in srgb, var(--accent) 45%, transparent), transparent)" }}
          />
          <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-night-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] transition-transform duration-700 ease-[var(--ease-out-expo)] [container-type:size] group-hover:scale-[1.025]">
            {project.media?.full && project.media.fullHeight ? (
              <Image
                src={project.media.full}
                alt={`Screenshot of the ${project.name} website`}
                width={1440}
                height={project.media.fullHeight}
                priority={priority}
                sizes="(max-width: 768px) 92vw, 50vw"
                className="scroll-shot absolute left-0 top-0 h-auto w-full"
              />
            ) : project.media ? (
              <Image
                src={project.media.desktop}
                alt={`Screenshot of the ${project.name} website`}
                fill
                priority={priority}
                sizes="(max-width: 768px) 92vw, 60vw"
                className="object-cover object-top"
              />
            ) : (
              <div className="grid h-full place-items-center">
                <span className="headline text-[clamp(2rem,6vw,5rem)] text-paper">{project.name}</span>
              </div>
            )}
          </div>
          <div className="absolute left-4 top-4 flex gap-2 sm:left-5 sm:top-5">
            {project.placeholder && <PlaceholderBadge />}
          </div>
          {typeof index === "number" && (
            <span className="label absolute right-4 top-4 text-fog sm:right-5 sm:top-5">({String(index + 1).padStart(2, "0")})</span>
          )}
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[1.15rem] font-semibold tracking-[-0.02em]">
            <Link href={`/work/${project.slug}`} className="link-underline">
              {project.name}
            </Link>
            <span className="ml-2 text-[0.8rem] font-normal text-muted">from</span>
            <span className="ml-2 text-[1.05rem] font-medium">{project.sector}</span>
          </h3>
          <p className="mt-1 max-w-lg text-[0.95rem] text-muted">{project.summary}</p>
        </div>
        <span className="label flex shrink-0 items-center gap-1 pt-1 text-muted transition-colors group-hover:text-ink">
          {hostOf(project.url)}
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </article>
  );
}

/** The empty slot that invites the next client. Doubles as the portfolio's empty state. */
export function ReservedCard() {
  return (
    <article className="group">
      <Link href="/contact" data-cursor="Start a project" className="block">
        <div className="relative grid aspect-[16/10] place-items-center overflow-hidden rounded-[10px] border border-dashed border-ink/25 bg-paper-2 p-[6%] text-center transition-colors duration-500 group-hover:border-ink group-hover:bg-paper-3">
          <div>
            <p className="label text-muted">(Reserved slot)</p>
            <p className="headline mt-4 text-[clamp(2rem,4.5vw,4rem)]">Your launch</p>
            <p className="mx-auto mt-3 max-w-xs text-[0.95rem] text-muted">This space is kept for the next company we launch.</p>
            <span className="label mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-paper">
              Start a project <ArrowUpRight className="size-3.5" aria-hidden />
            </span>
          </div>
        </div>
      </Link>
      <div className="mt-4">
        <h3 className="text-[1.15rem] font-semibold tracking-[-0.02em]">
          Next project <span className="ml-2 text-[0.8rem] font-normal text-muted">from</span>
          <span className="ml-2 text-[1.05rem] font-medium">You</span>
        </h3>
      </div>
    </article>
  );
}
