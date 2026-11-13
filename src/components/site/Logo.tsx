/** Launchly mark: a bold "L" with the ignition dot. Works on any background via currentColor. */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d="M7 5h5.6v17.2H24V27H7z" fill="currentColor" />
      <circle cx="22.6" cy="9.4" r="3.4" fill="var(--color-signal)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 [font-stretch:116%] font-extrabold tracking-[-0.035em] ${className}`}>
      <LogoMark className="h-[1.05em] w-[1.05em]" />
      <span>Launchly</span>
    </span>
  );
}

/** Full-width wordmark that always fits its container exactly (never cropped). */
export function GiantWordmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 205" className={className} aria-hidden preserveAspectRatio="xMidYMid meet">
      <path d="M8 22h36v130h78v31H8z" fill="currentColor" />
      <circle cx="104" cy="50" r="21" fill="var(--color-signal)" />
      <text
        x="150"
        y="183"
        textLength="842"
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
        style={{ font: "800 218px var(--font-archivo), sans-serif", fontStretch: "118%", letterSpacing: "-0.04em" }}
      >
        Launchly
      </text>
    </svg>
  );
}
