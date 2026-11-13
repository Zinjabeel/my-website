import type { Metadata } from "next";
import Link from "next/link";
import { StartClient } from "@/components/start/StartClient";
import { Eyebrow } from "@/components/ui/primitives";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Start a project",
  description: "Create a free Launchly account and send your project brief. We reply personally with a proposal and estimate.",
  alternates: { canonical: "/start" },
  openGraph: { url: "/start", title: "Start a project — Launchly" },
};

const steps = [
  { t: "Create your account", b: "Free, with just your name and email. It keeps your briefs and their status in one place." },
  { t: "Send your brief", b: "A few lines about your company and what the website should achieve is enough." },
  { t: "We reply personally", b: "With questions, first thoughts and — after a short call — a clear proposal and estimate." },
];

export default function StartPage() {
  return (
    <>
      <section className="wrap grid gap-12 py-12 md:py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow>Start a project</Eyebrow>
          <h1 className="display mt-6 text-[clamp(2.4rem,4.6vw,4rem)]">Tell us about your website.</h1>
          <p className="lead mt-6 max-w-md">Three short steps. No obligation — just the start of a conversation.</p>

          <ol className="mt-10 border-t-[1.5px] border-ink">
            {steps.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[3rem_1fr] border-b hairline py-5">
                <span className="label pt-1 text-signal">0{i + 1}</span>
                <div>
                  <p className="h-card !text-[1.1rem]">{s.t}</p>
                  <p className="mt-1.5 text-[0.95rem] text-muted">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-8 text-[0.95rem] text-muted">
            Just have a question?{" "}
            <Link href="/contact" className="link-underline font-semibold text-ink">
              Send a message instead
            </Link>{" "}
            — no account needed.
          </p>
        </div>

        <div className="lg:col-span-7">
          <StartClient />
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Start a project", path: "/start" }])} />
    </>
  );
}
