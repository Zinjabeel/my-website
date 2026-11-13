"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";

const KEY = "launchly-storage-notice";

/**
 * A notice, not a consent wall: the site sets no tracking or advertising cookies,
 * so there is nothing to accept or reject. It only explains the one thing we store (your login).
 */
export function CookieNotice() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* storage blocked — stay quiet */
    }
  }, []);

  if (!show || pathname.startsWith("/studio")) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <aside
      aria-label="Cookies and storage"
      className="card card-hard fixed bottom-4 left-4 right-4 z-[50] max-w-[26rem] bg-paper p-5 sm:right-auto"
      style={{ animation: "page-enter 0.5s var(--ease-out-expo) 0.8s both" }}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-paper-3" aria-hidden>
          <Cookie className="size-[1.1rem]" />
        </span>
        <p className="h-card !text-[1.05rem]">No tracking here</p>
      </div>
      <p className="mt-3 text-[0.9rem] text-ink-2">
        We don&apos;t use advertising or analytics cookies. If you log in, your browser stores one small item to keep you
        signed in — that&apos;s all.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={dismiss} className="btn btn-primary btn-sm">
          Got it
        </button>
        <Link href="/legal/cookies" className="link-underline text-[0.875rem] font-semibold">
          Cookie Policy
        </Link>
      </div>
    </aside>
  );
}
