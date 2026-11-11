"use client";

import { useLayoutEffect } from "react";

declare global {
  interface Window {
    __zoomArrival?: boolean;
  }
}

/**
 * When a page is reached from the holo viewer, skip the usual ink wipe and let the page
 * resolve from a zoom instead. Runs before first paint and only touches this page's own elements,
 * so nothing re-animates later.
 */
export function ZoomArrival() {
  useLayoutEffect(() => {
    if (!window.__zoomArrival) return;
    window.__zoomArrival = false;
    document.querySelector(".page-wipe")?.classList.add("is-skipped");
    document.getElementById("main")?.classList.add("is-zoom");
  }, []);
  return null;
}
