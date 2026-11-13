import type { Metadata } from "next";
import Link from "next/link";
import { CallToAction } from "@/components/site/CallToAction";
import { ProjectFeature, ReservedCard } from "@/components/work/ProjectCard";
import { PageHead } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/motion";
import { projects } from "@/content/projects";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Our Work",
  description: "Websites designed and developed by Launchly — case studies with previews, technology and what we built.",
  alternates: { canonical: "/work" },
  openGraph: { url: "/work", title: "Our Work — Launchly" },
};

export default function WorkPage() {
  const isDev = process.env.NODE_ENV === "development";
  return (
    <>
      <PageHead
        eyebrow="Our work"
        title="Websites we've launched."
        intro="Open a project for a full preview, what we delivered and the technology behind it."
      >
        {isDev && (
          <p className="label mt-6 text-muted">
            Development only —{" "}
            <Link href="/studio" className="link-underline text-ink">
              add a project by URL
            </Link>
          </p>
        )}
      </PageHead>

      <section aria-label="Projects" className="wrap section">
        <div className="space-y-16 md:space-y-24">
          {projects.map((p, i) => (
            <Reveal key={p.slug}>
              <ProjectFeature project={p} index={i} priority={i === 0} />
            </Reveal>
          ))}
          <Reveal>
            <ReservedCard />
          </Reveal>
        </div>
      </section>

      <CallToAction title="Your website could be next." />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
    </>
  );
}
