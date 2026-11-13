import { ButtonLink, Eyebrow } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="wrap grid min-h-[68vh] content-center py-20">
      <Eyebrow>Error 404 — case not found</Eyebrow>
      <h1 className="display h-page mt-6">Lost in the archive.</h1>
      <p className="lead mt-6 max-w-md">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/work" variant="outline">
          See our work
        </ButtonLink>
      </div>
    </section>
  );
}
