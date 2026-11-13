import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type Variant = "primary" | "signal" | "outline";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: "md" | "sm";
  external?: boolean;
  className?: string;
  icon?: boolean;
};

/** The one call-to-action style on the site. Renders a real link (internal or external). */
export function ButtonLink({ href, children, variant = "primary", size = "md", external, className = "", icon = true }: ButtonLinkProps) {
  const cls = `btn btn-${variant} ${size === "sm" ? "btn-sm" : ""} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
        {icon && <ArrowUpRight className="size-4" aria-hidden />}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
      {icon && <ArrowRight className="size-4" aria-hidden />}
    </Link>
  );
}

/** Small uppercase line above a heading. `dot` adds the signal mark. */
export function Eyebrow({ children, className = "", dot = true }: { children: React.ReactNode; className?: string; dot?: boolean }) {
  return (
    <p className={`eyebrow flex items-center gap-2.5 ${className}`}>
      {dot && <span aria-hidden className="size-2 shrink-0 rounded-full bg-signal" />}
      {children}
    </p>
  );
}

/**
 * The one section header on the site: eyebrow, title, optional intro and action,
 * always in the same positions so every section starts the same way.
 */
export function SectionHead({
  eyebrow,
  title,
  intro,
  action,
  id,
  as: Tag = "h2",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-10 grid gap-6 md:mb-14 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Tag id={id} className="display h-section mt-5">
          {title}
        </Tag>
        {intro && <p className="lead mt-5 max-w-2xl">{intro}</p>}
      </div>
      {action && <div className="md:col-span-4 md:justify-self-end">{action}</div>}
    </div>
  );
}

/** Top-of-page header used by every inner page, so they all open the same way. */
export function PageHead({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="border-b hairline">
      <div className="wrap pb-12 pt-12 md:pb-16 md:pt-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="display h-page mt-6 max-w-[18ch]">{title}</h1>
        {intro && <p className="lead mt-6 max-w-2xl">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

export function Tag({ children, tone = "outline" }: { children: React.ReactNode; tone?: "signal" | "ink" | "outline" }) {
  return <span className={`tag ${tone === "ink" ? "tag-ink" : tone === "outline" ? "tag-outline" : ""}`}>{children}</span>;
}

/** Visible marker for example / placeholder content. */
export function PlaceholderBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`tag ${className}`} title="Example entry used for testing — not real Launchly work">
      Example entry
    </span>
  );
}
