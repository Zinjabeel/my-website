import { Plus } from "lucide-react";
import type { Faq } from "@/content/offer";

/** Native <details> accordion: works without JavaScript and is keyboard accessible by default. */
export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="border-t-[1.5px] border-ink">
      {items.map((f) => (
        <details key={f.q} className="group border-b hairline">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="h-card !text-[clamp(1.05rem,1.4vw,1.25rem)]">{f.q}</span>
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-ink transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-paper"
              aria-hidden
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="max-w-2xl pb-6 text-[1.02rem] text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
