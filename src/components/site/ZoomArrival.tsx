"use client";

import { useLayoutEffect } from "react";

declare global {
  interface Window {
    __zoomArrival?: boolean;
  }
}

/**
 * When a page is reached from the holo viewer, it resolves out of a zoom instead of the usual settle.
 * Runs before first paint and only touches this page's own element, so nothing re-animates later.
 */
export function ZoomArrival() {
  useLayoutEffect(() => {
    if (!window.__zoomArrival) return;
    window.__zoomArrival = false;
    document.getElementById("main")?.classList.add("is-zoom");
  }, []);
  return null;
}
