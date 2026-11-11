import type { Metadata } from "next";
import { TopBar } from "@/components/site/TopBar";
import { ContactForm } from "@/components/contact/ContactForm";
import { SectionLabel } from "@/components/ui/primitives";
import { SplitWords } from "@/components/ui/motion";
import { site } from "@/content/site";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Launchly. Tell us about your company and what your new website needs to achieve.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact — Launchly" },
};

const steps = [
  { n: "01", t: "You send the brief", b: "A few lines about your company and goals is enough to start." },
  { n: "02", t: "We reply personally", b: "With questions, first thoughts and how we'd approach it." },
  { n: "03", t: "Discovery call", b: "We go deeper, then send a clear proposal and estimate." },
];

export default function ContactPage() {
  return (
    <>
      <TopBar section="Contact" />
      <section className="gutter pb-28 pt-[6vh]">
        <SectionLabel index="08">Start a project</SectionLabel>
        <h1 className="display mt-6 text-[clamp(3.4rem,11vw,11.5rem)]">
          <SplitWords text="Let's talk." immediate delay={0.4} />
        </h1>

        <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <p className="max-w-sm text-[1.15rem] leading-snug">
              Tell us about your company and what the website needs to do. No obligation — just a conversation.
            </p>

            <ol className="mt-10 border-t hairline">
              {steps.map((s) => (
                <li key={s.n} className="grid grid-cols-[2.5rem_1fr] border-b hairline py-5">
                  <span className="label pt-1 text-muted">{s.n}</span>
                  <div>
                    <p className="font-semibold tracking-[-0.02em]">{s.t}</p>
                    <p className="mt-1 text-[0.95rem] text-muted">{s.b}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 space-y-6">
              <div>
                <p className="label text-muted">Email</p>
                {site.emailIsPlaceholder ? (
                  <p className="mt-2 text-[0.95rem] text-muted">
                    <span className="label rounded bg-signal/15 px-1.5 py-0.5 text-ink">Placeholder</span> Public email
                    address coming soon — use the form for now.
                  </p>
                ) : (
                  <a href={`mailto:${site.email}`} className="link-underline mt-2 inline-block text-[1.15rem] font-medium">
                    {site.email}
                  </a>
                )}
              </div>
              {site.socials.length > 0 && (
                <div>
                  <p className="label text-muted">Social</p>
                  <ul className="mt-2 flex flex-wrap gap-4">
                    {site.socials.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          <div className="lg:col-span-7 lg:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}
