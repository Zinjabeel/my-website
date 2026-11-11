# Launchly — website

Website for **Launchly**, a website development studio. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Motion, Lenis and React Three Fiber.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm test             # Playwright end-to-end tests (desktop + mobile)
```

## Pages

| Route | What it is |
| --- | --- |
| `/` | Homepage — hero with the 3D "Launch Archive" shelf, intro, services, work, why us, process, CTA |
| `/work` | Portfolio grid |
| `/work/[slug]` | Case study with a large interactive preview (scrollable screenshot / sandboxed live site, desktop / mobile) |
| `/about` | About the team |
| `/process` | The seven-stage process |
| `/contact` | Working contact form |
| `/studio` | **Local development only** — add a project by URL |

## Adding a project

**Easiest:** run `npm run dev`, open <http://localhost:3000/studio>, paste the website URL and fill in the details.
The studio checks whether the site allows embedding (X-Frame-Options / CSP `frame-ancestors`), captures desktop,
full-page and mobile screenshots, and writes the entry to `src/content/projects.json`.

**Manually:** add an entry to `src/content/projects.json`, then run `npm run screenshots -- <slug>`.

Every page, card, the 3D shelf, the sitemap and the structured data read from that one file.
Sites that block embedding automatically fall back to screenshots — the live view is never forced.

> The current Astro entry is an **example placeholder** (marked `"placeholder": true`, shown with an "Example entry" badge, excluded from the sitemap). Replace it with real work.

## Contact form

The form posts to `/api/contact`, which validates input (zod), blocks cross-origin requests, rate-limits per IP and filters
spam (honeypot + minimum fill time). Delivery uses [Resend](https://resend.com):

1. Copy `.env.example` to `.env.local`
2. Set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`

Without a key, development saves submissions to `./.submissions/` and production shows an "email us directly" message.

## Content to confirm before launch

All business details live in `src/content/site.ts` and `src/content/offer.ts`.

- [ ] Public email address (`site.email` — currently a placeholder, hidden on the site)
- [ ] Domain (`NEXT_PUBLIC_SITE_URL`)
- [ ] Social profiles (`site.socials`)
- [ ] Real projects to replace the example entry
- [ ] Pricing / estimate questionnaire (planned)

## Libraries chosen (and why)

- **Next.js + React** — static pages, metadata/sitemap/OG APIs, API routes for the form.
- **Tailwind CSS v4** — design tokens in `src/app/globals.css` (`@theme`).
- **Motion** — reveals, dock indicator, accordion, menu sheet. All honour `prefers-reduced-motion`.
- **Lenis** — smooth scrolling on desktop (off for touch and reduced motion).
- **three + @react-three/fiber** — the hero shelf only; lazy-loaded, paused off-screen, with a still fallback.
- **lucide-react** — icons. **zod** — shared validation for form + API + project data.
- Not used on purpose: shadcn/ui, Aceternity, Magic UI. Their default looks fight this editorial design, and the few
  primitives needed (button, input, accordion) are small enough to own.
