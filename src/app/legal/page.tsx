import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHead } from "@/components/ui/primitives";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy, cookies, terms of use and accessibility at Launchly.",
  alternates: { canonical: "/legal" },
};

export default function LegalIndex() {
  return (
    <>
      <PageHead
        eyebrow="Legal"
        title="The fine print."
        intro="Plain-language policies that describe exactly how this website works. No tracking, no advertising cookies, no surprises."
      />
      <section className="wrap section">
        <ul className="grid gap-5 sm:grid-cols-2">
          {legalDocs.map((d, i) => (
            <li key={d.slug} className="flex">
              <Link href={`/legal/${d.slug}`} className="card card-link group flex w-full flex-col p-6 md:p-7">
                <span className="label text-muted">L-{String(i + 1).padStart(2, "0")}</span>
                <h2 className="h-card mt-7">{d.title}</h2>
                <p className="mt-2.5 flex-1 text-[0.975rem] text-ink-2">{d.description}</p>
                <span className="eyebrow mt-6 inline-flex items-center gap-2 border-t hairline pt-4">
                  Read <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
