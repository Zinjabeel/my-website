"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Contextual cursor label. Only appears over elements with `data-cursor="Label"`
 * and only for fine pointers. The native cursor is never hidden.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(fine.matches && !reduce.matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cursor]");
      setLabel(el?.dataset.cursor || null);
    };
    const onLeave = () => setLabel(null);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95]"
      style={{ x: sx, y: sy }}
    >
      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            className="label absolute left-4 top-4 flex items-center gap-2 whitespace-nowrap rounded-full bg-signal px-3.5 py-2 text-signal-ink shadow-lg"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <span className="size-1.5 rounded-full bg-signal-ink" />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
