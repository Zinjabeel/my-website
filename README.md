# Launchly — website

Website for **Launchly**, a website development studio. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Motion, Lenis, React Three Fiber and Supabase.

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
| `/` | Homepage — hero with the latest launch, the 3D Launch Archive, work, services, why, process, FAQ |
| `/work`, `/work/[slug]` | Portfolio and case studies with a large preview (scrollable screenshot / sandboxed live site) |
| `/services`, `/services/[slug]` | All services and one page per service |
| `/process`, `/about`, `/contact` | Process, about, and a contact form that needs no account |
| `/start` | **Start a project** — opens the login / sign-up dialog, then the project brief form |
| `/account` | Signed-in home: your briefs and their status, log out, delete account |
| `/auth/reset` | Landing page for password-reset emails |
| `/legal/*` | Privacy, cookies, terms, accessibility |
| `/studio` | **Local development only** — add a portfolio project by URL |

## Design system

Everything is built from a small set of pieces in `src/app/globals.css` and `src/components/ui/primitives.tsx`:

- **Colour:** paper, ink and one signal colour (orange), used sparingly.
- **Type:** Archivo (expanded and heavy for headlines, regular for text) and Geist Mono for small metadata.
- **Layout:** one container (`.wrap`), one section rhythm (`.section`), light and dark bands that alternate.
- **Components:** one button (`.btn`), one card (`.card`, hard shadow), one tag, one form field, one section header (`SectionHead`) and one page header (`PageHead`).
- **Motion:** a single short fade on scroll (`Reveal`). The 3D archive is the only loud moment. Everything honours `prefers-reduced-motion`.

## Accounts, briefs and contact messages (Supabase)

1. Create a Supabase project (the free plan is enough to start).
2. Run `supabase/migrations/0001_launchly_accounts.sql` in the SQL Editor.
3. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. In Supabase → Authentication → URL Configuration, set the Site URL and add `https://yourdomain/**` and `http://localhost:3000/**` to the redirect URLs.

What you get:

- Email + password accounts with confirmation emails, password reset, and password rules shown live.
- Project briefs saved per account. Each account can read only its own briefs (row-level security).
- Contact messages stored in the `contact_messages` table (insert-only from outside).
- Flood guards in the database, and "delete my account" that removes the account and its briefs.

Read briefs and messages in Supabase → Table Editor. Change a brief's `status` (`received`, `in_review`, `replied`, `closed`) and the client sees it on their account page.

Until the two env values are set, the login dialog says accounts aren't switched on, and the contact form saves to `./.submissions/` in development.

**Before going public:** Supabase's built-in email sender is for testing (a few emails an hour). Add your own SMTP (for example Resend) under Authentication → Emails.

## Adding a portfolio project

**Easiest:** run `npm run dev`, open <http://localhost:3000/studio>, paste the website URL and fill in the details. The studio checks whether the site allows embedding, captures desktop, full-page and mobile screenshots (declining cookie banners first), and writes the entry to `src/content/projects.json`.

**Manually:** add an entry to `src/content/projects.json`, then run `npm run screenshots -- <slug>`.

Every page, the 3D archive, the sitemap and the structured data read from that one file. Sites that block embedding (like OGCW) automatically use screenshots.

## Content to confirm before launch

All business details live in `src/content/site.ts`, `src/content/offer.ts` and `src/content/legal.ts`.

- [ ] Public email address (`site.email` — currently a placeholder, hidden on the site)
- [ ] Domain (`NEXT_PUBLIC_SITE_URL`)
- [ ] Social profiles (`site.socials`)
- [ ] Legal details in the highlighted `[placeholders]` on the legal pages
- [ ] Supabase project and env values (accounts)
- [ ] More real projects in the portfolio
- [ ] Pricing / estimate questionnaire (planned)
