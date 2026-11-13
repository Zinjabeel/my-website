import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/content/offer";
import { Reveal } from "@/components/ui/motion";

/** Every service as an identical card that leads to its own page. */
export function ServicesGrid() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <Reveal as="li" key={s.id} delay={(i % 3) * 0.05} className="flex">
          <Link href={`/services/${s.id}`} className="card card-link group flex w-full flex-col p-6 md:p-7">
            <div className="flex items-center justify-between">
              <span className="label text-muted">S-{String(i + 1).padStart(2, "0")}</span>
              {s.id === "care" && <span className="tag">Included</span>}
            </div>
            <h3 className="h-card mt-8">{s.title}</h3>
            <p className="mt-3 flex-1 text-[0.975rem] text-ink-2">{s.summary}</p>
            <span className="eyebrow mt-7 inline-flex items-center gap-2 border-t hairline pt-4">
              Explore
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
