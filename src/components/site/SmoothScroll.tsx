"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis smooth scrolling, mounted as a side-effect (it never wraps or re-mounts the page tree).
 * Disabled for reduced-motion users and touch devices, where native scrolling is better.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let raf = 0;

    const start = () => {
      if (lenisRef.current || reduce.matches || coarse.matches) return;
      const lenis = new Lenis({ lerp: 0.11, anchors: true });
      lenisRef.current = lenis;
      window.__lenis = lenis;
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      window.__lenis = undefined;
    };
    const onChange = () => (reduce.matches ? stop() : start());

    start();
    reduce.addEventListener("change", onChange);
    return () => {
      reduce.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) return;
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
