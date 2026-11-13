/**
 * Central site configuration. Every business detail shown on the site comes from here.
 * Items marked TODO are placeholders that must be confirmed before going live.
 */
export const site = {
  name: "Launchly",
  legalName: "Launchly",
  tagline: "Websites for established companies — built to convert, rank and keep working.",
  description:
    "Launchly is a small website development team building fast, conversion-focused websites with a CMS and SEO built in — plus 12 months of updates at no extra charge.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://launchly.studio").replace(/\/$/, ""), // TODO: confirm domain
  founder: "Basam S.",
  yearsBuilding: 3,
  /** TODO: replace with the real public inbox before launch. */
  email: "hello@launchly.studio",
  emailIsPlaceholder: true,
  /** Add real profiles here; empty entries are not rendered. */
  socials: [
    // { label: "LinkedIn", href: "https://www.linkedin.com/company/..." },
    // { label: "Instagram", href: "https://www.instagram.com/..." },
  ] as { label: string; href: string }[],
  sectors: ["Tech", "News & media", "Construction", "Retail"],
  nav: [
    { href: "/work", label: "Work" },
    { href: "/services", label: "Services" },
    { href: "/process", label: "Process" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type Site = typeof site;
