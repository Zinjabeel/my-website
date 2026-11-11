/** Launchly mark: a bold "L" with the ignition dot. Works on any background via currentColor. */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M7 5h5.6v17.2H24V27H7z" fill="currentColor" />
      <circle cx="22.6" cy="9.4" r="3.4" fill="var(--color-signal)" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-[650] tracking-[-0.04em] ${className}`}>
      <LogoMark className="h-[1.05em] w-[1.05em]" />
      <span>
        Launchly<sup className="ml-0.5 align-super text-[0.5em] font-medium">®</sup>
      </span>
    </span>
  );
}
