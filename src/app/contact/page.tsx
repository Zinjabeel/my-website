import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/contact/ContactForm";
import { Eyebrow, PageHead } from "@/components/ui/primitives";
import { site } from "@/content/site";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask Launchly a question about your website, our services or how we work.",
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact", title: "Contact — Launchly" },
};

export default function ContactPage() {
  return (
    <>
      <PageHead
        eyebrow="Contact"
        title="Ask us anything."
        intro="A question about your website, our services or how we work? Send a message — no account needed, and a person replies."
      />

      <section className="wrap section">
        <div className="grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <Link href="/start" className="card card-hard card-link group block p-6">
              <span className="tag">Ready to begin?</span>
              <p className="h-card mt-5">Start a project</p>
              <p className="mt-2 text-[0.95rem] text-ink-2">
                Send a proper brief and track it from your account. It&apos;s the fastest way to a proposal and estimate.
              </p>
              <span className="eyebrow mt-6 inline-flex items-center gap-2">
                Send a brief <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>

            <div className="mt-10 space-y-7">
              <div>
                <Eyebrow dot={false}>Email</Eyebrow>
                {site.emailIsPlaceholder ? (
                  <p className="mt-2 text-[0.95rem] text-muted">A public email address is on its way — please use the form for now.</p>
                ) : (
                  <a href={`mailto:${site.email}`} className="link-underline mt-2 inline-block text-[1.1rem] font-semibold">
                    {site.email}
                  </a>
                )}
              </div>
              <div>
                <Eyebrow dot={false}>We work with</Eyebrow>
                <p className="mt-2 text-[0.95rem] text-ink-2">{site.sectors.join(", ")}.</p>
              </div>
              {site.socials.length > 0 && (
                <div>
                  <Eyebrow dot={false}>Social</Eyebrow>
                  <ul className="mt-2 flex flex-wrap gap-4">
                    {site.socials.map((s) => (
                      <li key={s.href}>
                        <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-underline font-semibold">
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
