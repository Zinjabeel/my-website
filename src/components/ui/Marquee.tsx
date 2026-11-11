/** Infinite kinetic type band. Pure CSS; pauses on hover and for reduced motion. */
export function Marquee({ items, tone = "ink" }: { items: string[]; tone?: "ink" | "signal" }) {
  const row = (
    <span className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="display px-[0.35em] text-[clamp(3rem,8.5vw,8.5rem)] leading-[1.05]">{t}</span>
          <span aria-hidden className="mx-[0.2em] inline-block size-[0.6em] rounded-full bg-signal align-middle text-[clamp(1.4rem,3vw,3rem)]" />
        </span>
      ))}
    </span>
  );
  return (
    <div
      className={`group relative flex overflow-hidden py-6 ${tone === "signal" ? "bg-signal text-signal-ink" : "bg-ink text-paper"}`}
      aria-label={items.join(", ")}
      role="marquee"
    >
      <div aria-hidden className="marquee-track flex group-hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
