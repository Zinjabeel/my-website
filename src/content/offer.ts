/** Services, principles and process — the studio's offer, all in one place. */

export type Service = {
  /** Also the URL slug: /services/<id> */
  id: string;
  title: string;
  summary: string;
  detail: string;
  tags: string[];
  /** What the client gets. */
  included: string[];
  /** Who it's for / when it makes sense. */
  fit: string;
};

export const services: Service[] = [
  {
    id: "build",
    title: "Website design & development",
    summary: "Custom-designed, hand-built websites for companies that have outgrown their template.",
    detail:
      "Strategy, structure, interface design and development under one roof. Every page is designed for your business and engineered to be fast, accessible and easy to extend.",
    tags: ["UI/UX", "Next.js", "Responsive"],
    included: [
      "Discovery and sitemap planning",
      "Custom visual direction and page designs",
      "Responsive build for every screen size",
      "Accessibility and performance built in",
      "Launch, hosting setup and handover",
    ],
    fit: "For established companies whose current website no longer reflects the quality of the business.",
  },
  {
    id: "leads",
    title: "Lead-focused pages",
    summary: "Websites structured around one job: turning visitors into enquiries.",
    detail:
      "Clear offers, deliberate calls to action, short forms and fast load times. We plan every key page around the action you want a visitor to take.",
    tags: ["Conversion", "Forms", "CTA strategy"],
    included: [
      "A clear goal and call to action for every key page",
      "Offer and messaging structure that answers objections",
      "Short, fast enquiry forms with useful validation",
      "Enquiries delivered straight to your inbox",
      "Measurement so you can see what works",
    ],
    fit: "For companies that get visitors but not enough enquiries — or can't tell where enquiries come from.",
  },
  {
    id: "cms",
    title: "CMS & content systems",
    summary: "Update pages, posts and projects yourself — no developer needed for day-to-day changes.",
    detail:
      "Your team gets a content system modelled around how you actually publish, so the website keeps growing after launch instead of going stale.",
    tags: ["Headless CMS", "Editing", "Content model"],
    included: [
      "A content model shaped around your pages, posts and projects",
      "An editing interface your team can learn in an afternoon",
      "Reusable page sections for new pages without a developer",
      "Image handling that keeps pages fast automatically",
      "A walkthrough and written guide for your team",
    ],
    fit: "For teams that publish news, projects or products and are tired of waiting on a developer for every change.",
  },
  {
    id: "seo",
    title: "SEO foundations",
    summary: "Technical SEO built in from day one — not bolted on after launch.",
    detail:
      "Clean URLs, semantic markup, structured data, metadata, sitemaps and real-world performance. The groundwork that lets search engines understand and rank you long term.",
    tags: ["Technical SEO", "Schema", "Core Web Vitals"],
    included: [
      "Search-friendly URL structure and redirects from your old site",
      "Titles, descriptions and social previews for every page",
      "Structured data so search engines understand your business",
      "XML sitemap, robots rules and canonical URLs",
      "Performance tuned for Core Web Vitals",
    ],
    fit: "For companies that want to be found for what they do — and keep their rankings through a redesign.",
  },
  {
    id: "marketing",
    title: "Marketing-ready build",
    summary: "A website that is easy to market: tracking, landing pages and share previews ready to go.",
    detail:
      "Analytics, campaign-ready landing page templates and polished social previews, so your marketing team can move without waiting on development.",
    tags: ["Analytics", "Landing pages", "Open Graph"],
    included: [
      "Privacy-friendly analytics set up and explained",
      "Landing page templates for campaigns",
      "Polished share previews for social and messaging apps",
      "Clean tracking for forms and key actions",
      "A site structure that makes new campaigns quick to launch",
    ],
    fit: "For companies with active marketing — newsletters, ads, social — that need the website to keep up.",
  },
  {
    id: "care",
    title: "12 months of care",
    summary: "Touch-ups, changes and updates included for the first 12 months — at no extra charge.",
    detail:
      "Launch is the start, not the finish. For a full year after launch we keep refining the site with you: content changes, small improvements and updates are included.",
    tags: ["Included", "Updates", "Support"],
    included: [
      "Content changes and touch-ups on request",
      "Small improvements based on how visitors use the site",
      "Updates to keep the website secure and current",
      "A direct line to the team that built it",
      "No extra charge for the first 12 months",
    ],
    fit: "Included with every website we build. Launch is the start, not the finish.",
  },
];

export type Principle = { id: string; title: string; body: string };

export const principles: Principle[] = [
  {
    id: "leads",
    title: "Leads, not just looks",
    body: "A beautiful website that doesn't generate enquiries is a brochure. We design every page around the action that grows your business.",
  },
  {
    id: "long-term",
    title: "Built for the long term",
    body: "A CMS your team can use and SEO that's right from the first line of code — so the website keeps performing years after launch.",
  },
  {
    id: "marketable",
    title: "Easy to market",
    body: "Fast pages, clean share previews and room for campaigns. Your marketing team should feel the website working with them.",
  },
  {
    id: "included",
    title: "12 months included",
    body: "Touch-ups, changes and updates for the first 12 months at no extra charge. No surprise invoices for small requests.",
  },
];

export type Stage = {
  id: string;
  number: string;
  title: string;
  short: string;
  body: string;
  deliverables: string[];
};

export const stages: Stage[] = [
  {
    id: "discovery",
    number: "01",
    title: "Discovery",
    short: "Understand the business",
    body: "We start with your business, not your website: who you sell to, what makes you different, what a good lead looks like and where the current site falls short.",
    deliverables: ["Kick-off session", "Goals & success criteria", "Audience notes"],
  },
  {
    id: "research",
    number: "02",
    title: "Research & planning",
    short: "Map the ground",
    body: "Competitors, search intent, existing content and analytics. We turn what we learn into a clear plan with scope, priorities and timeline.",
    deliverables: ["Competitor scan", "Keyword & intent research", "Project plan"],
  },
  {
    id: "architecture",
    number: "03",
    title: "Sitemap & architecture",
    short: "Structure before style",
    body: "We define every page, its job and how visitors move between them — and model the content so your CMS fits the way you work.",
    deliverables: ["Sitemap", "Page goals & wireframes", "Content model"],
  },
  {
    id: "design",
    number: "04",
    title: "UI/UX & visual direction",
    short: "Make it unmistakably yours",
    body: "Typography, colour, layout and motion that feel like your brand. Designed in context, reviewed with you, refined until it's right.",
    deliverables: ["Visual direction", "Key page designs", "Responsive system"],
  },
  {
    id: "development",
    number: "05",
    title: "Development",
    short: "Engineer it properly",
    body: "Clean, maintainable code with the CMS, forms, SEO foundations and integrations built in. You can follow progress on a live preview.",
    deliverables: ["Production build", "CMS setup", "Integrations"],
  },
  {
    id: "testing",
    number: "06",
    title: "Testing & optimisation",
    short: "Leave nothing to chance",
    body: "Every page, browser and breakpoint. Performance, accessibility, forms, redirects and tracking — checked before anyone else sees it.",
    deliverables: ["QA across devices", "Performance pass", "Accessibility checks"],
  },
  {
    id: "launch",
    number: "07",
    title: "Launch & ongoing support",
    short: "Lift-off — and after",
    body: "We handle the launch, monitor it closely and stay on board: changes, touch-ups and updates are included for the first 12 months.",
    deliverables: ["Launch & monitoring", "Team handover", "12 months of care"],
  },
];
