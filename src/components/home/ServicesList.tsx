"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import { services } from "@/content/offer";

/** Editorial accordion of services. One row open at a time; fully keyboard accessible. */
export function ServicesList() {
  const [open, setOpen] = useState<string>(services[0].id);
  return (
    <ul className="border-t hairline">
      {services.map((s, i) => {
        const isOpen = open === s.id;
        return (
          <li key={s.id} className="border-b hairline">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`svc-${s.id}`}
                onClick={() => setOpen(isOpen ? "" : s.id)}
                className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 text-left md:grid-cols-[5rem_1fr_1fr_auto] md:py-8"
              >
                <span className="label text-muted">0{i + 1}</span>
                <span className="headline text-[clamp(1.6rem,3.6vw,3.25rem)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
                  {s.title}
                </span>
                <span className="hidden max-w-sm text-[0.95rem] text-muted md:block">{s.summary}</span>
                <span
                  className={`grid size-10 place-items-center rounded-full border transition-[transform,background-color,color] duration-300 ${
                    isOpen ? "rotate-45 border-ink bg-ink text-paper" : "border-line group-hover:border-ink"
                  }`}
                  aria-hidden
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`svc-${s.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 pb-8 md:grid-cols-[5rem_1fr_1fr_auto] md:gap-4">
                    <span className="hidden md:block" />
                    <p className="max-w-xl text-[1.05rem] text-ink-2">{s.detail}</p>
                    <ul className="flex flex-wrap content-start gap-2">
                      {s.tags.map((t) => (
                        <li key={t} className="label rounded-full border hairline px-3 py-1.5 text-ink-2">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
