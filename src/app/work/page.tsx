import type { Metadata } from "next";
import Link from "next/link";
import { TopBar } from "@/components/site/TopBar";
import { CallToAction } from "@/components/site/CallToAction";
import { ProjectCard, ReservedCard } from "@/components/work/ProjectCard";
import { SectionLabel } from "@/components/ui/primitives";
import { Reveal, SplitWords } from "@/components/ui/motion";
import { projects } from "@/content/projects";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Websites designed and developed by Launchly — case studies with live previews, technology and what we built.",
  alternates: { canonical: "/work" },
  openGraph: { url: "/work", title: "Our Work — Launchly" },
};

export default function WorkPage() {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <>
      <TopBar section="Work" />
      <section className="gutter pb-16 pt-[6vh] md:pb-24">
        <SectionLabel index={String(projects.length).padStart(2, "0")}>Projects in the archive</SectionLabel>
        <h1 className="display mt-6 text-[clamp(3.6rem,14vw,15rem)]">
          <SplitWords text="Our work" immediate delay={0.4} />
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-12">
          <p className="max-w-xl text-[clamp(1.05rem,1.4vw,1.3rem)] leading-snug md:col-span-6 md:col-start-4">
            Websites we&apos;ve designed and built. Open any project for a live preview, what we delivered and the technology
            behind it.
          </p>
          {isDev && (
            <p className="label text-muted md:col-span-3 md:justify-self-end md:text-right">
              Dev only:{" "}
              <Link href="/studio" className="text-ink underline">
                add a project by URL
              </Link>
            </p>
          )}
        </div>
      </section>

      <section aria-label="Projects" className="gutter pb-28 md:pb-40">
        <div className="grid gap-x-4 gap-y-16 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 2) * 0.08}>
              <ProjectCard project={p} index={i} priority={i < 2} />
            </Reveal>
          ))}
          <Reveal delay={0.1}>
            <ReservedCard />
          </Reveal>
        </div>
      </section>

      <CallToAction title={["Your website", "could be next."]} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
    </>
  );
}
