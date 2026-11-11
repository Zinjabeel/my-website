import { ButtonLink } from "@/components/ui/primitives";

export function CallToAction({ title = ["Let's launch", "something."] }: { title?: [string, string] }) {
  return (
    <section aria-labelledby="cta-title" className="gutter pb-10">
      <div className="relative overflow-hidden rounded-[10px] bg-signal px-6 py-20 text-signal-ink md:px-12 md:py-28">
        <p className="label">(Ready when you are)</p>
        <h2 id="cta-title" className="display mt-6 text-[clamp(3.2rem,10vw,10.5rem)]">
          {title[0]}
          <br />
          {title[1]}
        </h2>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-[1.1rem]">
            Tell us about your company and what the website needs to do. We&apos;ll reply with how we&apos;d approach it.
          </p>
          <ButtonLink href="/contact" variant="ink">
            Start a project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
