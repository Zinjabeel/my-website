import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/site/TopBar";
import { SplitWords } from "@/components/ui/motion";
import { legalDocs } from "@/content/legal";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy, cookies, terms of use and accessibility at Launchly.",
  alternates: { canonical: "/legal" },
};

export default function LegalIndex() {
  return (
    <>
      <TopBar section="Legal" />
      <section className="gutter pb-28 pt-[6vh]">
        <p className="label text-muted">(Legal)</p>
        <h1 className="display mt-6 text-[clamp(3.4rem,11vw,11rem)]">
          <SplitWords text="The fine print." immediate delay={0.4} />
        </h1>
        <p className="mt-8 max-w-xl text-[1.15rem] text-ink-2">
          Plain-language policies that describe exactly how this website works. No tracking, no cookie banner, no surprises.
        </p>
        <ul className="mt-16 border-t hairline">
          {legalDocs.map((d, i) => (
            <li key={d.slug} className="border-b hairline">
              <Link href={`/legal/${d.slug}`} className="group grid items-center gap-4 py-8 md:grid-cols-[5rem_1fr_1.2fr_auto]">
                <span className="label text-muted">0{i + 1}</span>
                <span className="headline text-[clamp(1.8rem,3.6vw,3.25rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {d.title}
                </span>
                <span className="text-muted">{d.description}</span>
                <span className="grid size-11 place-items-center rounded-full border hairline transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper" aria-hidden>
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
