import { ButtonLink, Eyebrow } from "@/components/ui/primitives";

/** The closing band used at the end of every page. */
export function CallToAction({
  title = "Ready when you are.",
  body = "Tell us about your company and what the website needs to do. We'll reply personally with how we'd approach it.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section aria-labelledby="cta-title" className="band-ink">
      <div className="wrap section grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <Eyebrow className="text-fog">Start a project</Eyebrow>
          <h2 id="cta-title" className="display mt-6 text-[clamp(2.6rem,7vw,6rem)]">
            {title}
          </h2>
        </div>
        <div className="md:col-span-4">
          <p className="lead">{body}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/start" variant="signal">
              Start a project
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" icon={false}>
              Ask a question
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
