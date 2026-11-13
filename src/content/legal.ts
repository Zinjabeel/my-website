/**
 * Legal pages. Written to match what this website actually does today:
 * no analytics, no advertising, no tracking cookies, self-hosted fonts, a contact form delivered by email.
 * Items in [brackets] are placeholders that must be completed before launch — they are highlighted on the page.
 * This is a practical starting point, not legal advice: have it reviewed for your jurisdiction.
 */

export type LegalSection = { id: string; title: string; body: string[] };
export type LegalDoc = {
  slug: string;
  title: string;
  short: string;
  description: string;
  updated: string;
  sections: LegalSection[];
};

const UPDATED = "2026-11-13";

export const legalDocs: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    short: "Privacy",
    description: "How Launchly collects, uses and protects personal data submitted through this website.",
    updated: UPDATED,
    sections: [
      {
        id: "who",
        title: "Who we are",
        body: [
          "This website is operated by Launchly ([legal company name], [registered address], [company registration number]). Launchly is the controller of the personal data described in this policy.",
          "Questions about privacy can be sent to [privacy contact email].",
        ],
      },
      {
        id: "what",
        title: "What we collect",
        body: [
          "Contact form: when you send a message we receive your name, email address, and — if you choose to give them — your company, project type, budget range and the message you write.",
          "Account: if you create an account we store your name, email address and a securely hashed password (we never see the password itself).",
          "Project briefs: when you send a brief from your account we store what you write in it — your company, current website, the type of project, your goals, and optionally a budget range and timeline.",
          "Technical data: like every website, our hosting provider automatically processes basic request data (IP address, browser type, requested page, time) to deliver pages and keep the service secure. We do not use this to identify you.",
          "We do not use analytics, advertising or tracking tools, and we do not build profiles of visitors.",
        ],
      },
      {
        id: "why",
        title: "Why we use it (legal basis)",
        body: [
          "We use contact messages, account details and project briefs only to reply to you and, if we work together, to prepare and manage the project. The legal basis is taking steps at your request before entering into a contract, and our legitimate interest in responding to business enquiries.",
          "Technical request data is processed on the basis of our legitimate interest in operating a secure, working website.",
        ],
      },
      {
        id: "sharing",
        title: "Who we share it with",
        body: [
          "We never sell personal data. We share it only with service providers who help us run the website and deliver your message: our hosting provider ([hosting provider, e.g. Vercel Inc.]), our account and database provider (Supabase) and our email delivery provider ([email provider, e.g. Resend]). They process data on our behalf under data processing agreements.",
          "Some providers may process data outside your country. Where that happens, we rely on appropriate safeguards such as standard contractual clauses.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep it",
        body: [
          "Messages and briefs that do not lead to a project are deleted within [12] months. If we work together, project correspondence is kept for as long as needed for the project and any legal or accounting obligations.",
          "You can delete your account at any time from your account page. That removes your account and every brief you have sent, immediately.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        body: [
          "Depending on where you live, you can ask to access, correct, delete or export your personal data, object to or restrict its processing, and withdraw consent at any time. Email [privacy contact email] and we will respond within one month.",
          "You also have the right to lodge a complaint with your local data protection authority.",
        ],
      },
      {
        id: "security",
        title: "Security",
        body: [
          "The website is served over HTTPS with strict security headers. Forms validate every submission and are protected against spam and abuse. Each account can only read its own briefs — this is enforced in the database itself — and we limit access to messages and briefs to the people who need it.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this policy",
        body: ["If we change how we handle personal data, we will update this page and the date at the top."],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    short: "Cookies",
    description: "Launchly's website uses no tracking or advertising cookies. Here is exactly what is stored.",
    updated: UPDATED,
    sections: [
      {
        id: "summary",
        title: "The short version",
        body: [
          "This website uses no analytics cookies, no advertising cookies and no third-party tracking. The only things stored in your browser are strictly necessary ones, listed below — which is why you see a short notice instead of a consent banner: there is nothing optional to accept or reject.",
        ],
      },
      {
        id: "storage",
        title: "What is stored in your browser",
        body: [
          "Login: if you log in, your browser's local storage keeps a session token so you stay signed in. It is removed when you log out or delete your account.",
          "Notice: once you dismiss the storage notice, a single local-storage entry remembers that so it doesn't appear again.",
          "Nothing else. Fonts are hosted on our own domain, so no requests are made to external font services. Your browser may cache files (images, scripts, styles) so pages load faster; you can clear this cache at any time.",
        ],
      },
      {
        id: "previews",
        title: "Live website previews",
        body: [
          "On a case study page you can choose to load a client's website in a live preview. Only when you press 'Live site' is that external website loaded inside a sandboxed frame. That website may set its own cookies under its own policy. If you prefer not to, use the screenshot view, which loads nothing from third parties.",
        ],
      },
      {
        id: "changes",
        title: "If this changes",
        body: [
          "If we ever add analytics or other optional cookies, we will ask for your consent first with a clear choice to decline, and list every cookie on this page.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Use",
    short: "Terms",
    description: "The terms that apply when you use the Launchly website.",
    updated: UPDATED,
    sections: [
      {
        id: "scope",
        title: "Scope",
        body: [
          "These terms apply to your use of this website. Design and development projects are governed by a separate written agreement between Launchly and the client.",
        ],
      },
      {
        id: "content",
        title: "Website content",
        body: [
          "All content on this website — text, design, graphics and code — belongs to Launchly unless stated otherwise. You may view and share pages for personal or internal business use, but you may not copy, republish or sell the content without our written permission.",
          "Project screenshots and previews show work created for our clients; the clients' names, brands and websites remain their property.",
        ],
      },
      {
        id: "accounts",
        title: "Accounts",
        body: [
          "You can create a free account to send project briefs and follow their status. Please give accurate details, keep your password to yourself and tell us if you think someone else has used your account.",
          "You can delete your account at any time. We may suspend accounts that are used to send spam or misuse the service.",
        ],
      },
      {
        id: "info",
        title: "Information on this site",
        body: [
          "We keep this website accurate and up to date, but its content is general information about our services, not a binding offer. Prices, timelines and scope are only confirmed in a written proposal.",
        ],
      },
      {
        id: "links",
        title: "External links",
        body: [
          "This website links to and can preview external websites. We are not responsible for their content, availability or privacy practices.",
        ],
      },
      {
        id: "acceptable",
        title: "Acceptable use",
        body: [
          "Please don't misuse the website or the contact form — for example by sending spam, attempting to access systems without permission, or disrupting the service.",
        ],
      },
      {
        id: "liability",
        title: "Liability",
        body: [
          "To the extent permitted by law, Launchly is not liable for losses arising from the use of this website. Nothing in these terms limits liability that cannot be limited by law.",
        ],
      },
      {
        id: "law",
        title: "Governing law",
        body: ["These terms are governed by the laws of [country / jurisdiction]. Disputes are subject to the courts of [city / jurisdiction]."],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility Statement",
    short: "Accessibility",
    description: "Launchly's commitment to an accessible website and how to report a barrier.",
    updated: UPDATED,
    sections: [
      {
        id: "commitment",
        title: "Our commitment",
        body: [
          "We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA, and we build client websites to the same standard.",
        ],
      },
      {
        id: "measures",
        title: "What we've done",
        body: [
          "Semantic HTML and a logical heading structure, full keyboard navigation with visible focus, a skip link, labelled form fields with clear error messages, sufficient colour contrast and descriptive alternative text.",
          "All animation respects your system's 'reduce motion' setting: the 3D archive is replaced with a still image and transitions become instant. Every item in the 3D archive is also available as a normal link.",
        ],
      },
      {
        id: "limits",
        title: "Known limitations",
        body: [
          "Live previews of client websites load third-party content that we don't control and may not be fully accessible; the screenshot view and the written case study are always available as an alternative.",
        ],
      },
      {
        id: "feedback",
        title: "Report a barrier",
        body: ["If something on this website doesn't work for you, tell us through the contact form or at [accessibility contact email]. We aim to respond within five working days."],
      },
    ],
  },
];

export function getLegalDoc(slug: string) {
  return legalDocs.find((d) => d.slug === slug);
}
