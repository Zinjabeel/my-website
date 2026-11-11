import { TopBar } from "@/components/site/TopBar";
import { ButtonLink } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <>
      <TopBar section="404" />
      <section className="gutter grid min-h-[70vh] content-center py-20">
        <p className="label text-muted">(Error 404) — Tape not found</p>
        <h1 className="display mt-6 text-[clamp(4rem,16vw,16rem)]">
          Lost in
          <br />
          <span className="text-ink/35">the archive.</span>
        </h1>
        <p className="mt-8 max-w-md text-[1.1rem] text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">Back home</ButtonLink>
          <ButtonLink href="/work" variant="ghost">
            See our work
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
