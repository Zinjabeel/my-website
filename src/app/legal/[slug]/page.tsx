import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/TopBar";
import { SplitWords } from "@/components/ui/motion";
import { getLegalDoc, legalDocs } from "@/content/legal";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return legalDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getLegalDoc((await params).slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
    openGraph: { url: `/legal/${doc.slug}`, title: `${doc.title} — Launchly` },
  };
}

/** Renders text and highlights [placeholders] that still need real details. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[^\]]+\])/g).map((part, i) =>
        part.startsWith("[") ? (
          <mark key={i} className="rounded bg-signal/20 px-1 text-ink" title="Placeholder — complete before launch">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default async function LegalPage({ params }: Props) {
  const doc = getLegalDoc((await params).slug);
  if (!doc) notFound();
  const hasPlaceholders = doc.sections.some((s) => s.body.some((b) => b.includes("[")));
  const updated = new Date(doc.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <TopBar section="Legal" />
      <section className="gutter pb-12 pt-[6vh] md:pb-20">
        <nav aria-label="Legal documents" className="flex flex-wrap gap-2">
          {legalDocs.map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              aria-current={d.slug === doc.slug ? "page" : undefined}
              className="label rounded-full border hairline px-3.5 py-2 text-ink-2 transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
            >
              {d.short}
            </Link>
          ))}
        </nav>
        <h1 className="display mt-10 text-[clamp(3rem,9vw,9rem)]">
          <SplitWords text={doc.title} immediate delay={0.4} />
        </h1>
        <p className="label mt-6 text-muted">Last updated — {updated}</p>
      </section>

      <div className="gutter grid gap-12 pb-28 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav aria-label="On this page" className="lg:sticky lg:top-8">
            <p className="label text-muted">On this page</p>
            <ol className="mt-4 space-y-2 border-l hairline pl-4">
              {doc.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[0.95rem] text-ink-2 transition-colors hover:text-ink">
                    <span className="label mr-2 text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="max-w-3xl lg:col-span-8 lg:col-start-5">
          {hasPlaceholders && (
            <div role="note" className="mb-12 rounded-[10px] border border-signal/50 bg-signal/10 p-5 text-[0.95rem]">
              <p className="label text-ink">Draft — needs completing before launch</p>
              <p className="mt-2 text-ink-2">
                Highlighted items like <mark className="rounded bg-signal/20 px-1">[this]</mark> are placeholders for your legal
                details. This text describes how the website currently works, but it is not legal advice — have it reviewed
                for your jurisdiction.
              </p>
            </div>
          )}
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-10 border-t hairline py-10 first:border-t-0 first:pt-0">
              <h2 className="flex items-baseline gap-4 text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.03em]">
                <span className="label text-muted">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className="mt-5 space-y-4 text-[1.075rem] leading-relaxed text-ink-2">
                {s.body.map((p, j) => (
                  <p key={j}>
                    <Rich text={p} />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: doc.title, path: `/legal/${doc.slug}` },
        ])}
      />
    </>
  );
}
