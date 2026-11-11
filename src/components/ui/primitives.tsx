import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** "(02) Services" style section label. */
export function SectionLabel({ index, children, className = "" }: { index?: string; children: React.ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 text-muted ${className}`}>
      {index && <span>({index})</span>}
      <span>{children}</span>
    </p>
  );
}

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "signal" | "ink" | "ghost" | "paper";
  external?: boolean;
  className?: string;
  cursor?: string;
};

const variants = {
  signal: "bg-signal text-signal-ink hover:brightness-110",
  ink: "bg-ink text-paper hover:bg-ink-2",
  paper: "bg-paper text-ink hover:bg-paper-2",
  ghost: "border border-current/25 hover:border-current",
};

/** Primary call-to-action link with a rolling arrow. */
export function ButtonLink({ href, children, variant = "ink", external, className = "", cursor }: ButtonProps) {
  const cls = `group inline-flex h-12 items-center gap-3 rounded-[10px] pl-5 pr-2 text-[0.9375rem] font-semibold tracking-[-0.01em] transition-[background-color,filter,border-color,transform] duration-200 active:scale-[0.98] ${variants[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[7px] bg-current/10" aria-hidden>
        <ArrowUpRight className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-8 group-hover:translate-x-8" />
        <ArrowUpRight className="absolute size-4 -translate-x-8 translate-y-8 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" />
      </span>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} data-cursor={cursor}>
        {inner}
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-cursor={cursor}>
      {inner}
    </Link>
  );
}

/** Small mono tag. */
export function Tag({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={`label inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6875rem] ${
        tone === "light" ? "border-line text-ink-2" : "border-night-3 text-fog"
      }`}
    >
      {children}
    </span>
  );
}

/** Visible marker for example / placeholder content. */
export function PlaceholderBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`label inline-flex items-center gap-1.5 rounded-full bg-signal px-2.5 py-1 text-[0.6875rem] font-semibold text-signal-ink ${className}`}
      title="Example entry used for testing — not real Launchly work"
    >
      <span className="size-1.5 rounded-full bg-signal-ink" aria-hidden />
      Example entry
    </span>
  );
}
