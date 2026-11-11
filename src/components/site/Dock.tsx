"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { LogoMark } from "./Logo";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Floating bottom dock — the site's primary navigation.
 * Desktop/tablet: every destination visible. Phone: mark + menu + CTA, menu opens a full sheet.
 */
export function Dock() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes; focus moves into the sheet and back to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    window.__lenis?.stop();
    return () => {
      document.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [open]);

  if (pathname.startsWith("/studio")) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheetRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-night px-4 pb-28 text-paper sm:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
          >
            <p className="label mb-6 text-fog">(Menu)</p>
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {[{ href: "/", label: "Home" }, ...site.nav].map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduce ? false : { y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className="headline flex items-baseline justify-between border-b border-night-3 py-3 text-[2.75rem] aria-[current=page]:text-signal"
                    >
                      {item.label}
                      <span className="label text-fog">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            {!site.emailIsPlaceholder && (
              <a href={`mailto:${site.email}`} className="label mt-8 text-fog">
                {site.email}
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Primary"
        className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[70] flex justify-center px-3"
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-[12px] border border-night-3 bg-night p-1.5 text-paper shadow-[0_18px_50px_-12px_rgb(0_0_0/0.45)]">
          <Link
            href="/"
            aria-label="Launchly — home"
            aria-current={pathname === "/" ? "page" : undefined}
            className="grid size-11 place-items-center rounded-[8px] bg-paper text-ink transition-transform duration-300 hover:scale-[0.96]"
          >
            <LogoMark className="size-6" />
          </Link>

          <ul className="hidden items-center gap-1 sm:flex">
            {site.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="relative z-10 flex h-11 items-center rounded-[8px] px-4 text-[0.8125rem] font-medium tracking-[-0.01em] text-paper/80 transition-colors duration-200 hover:text-paper aria-[current=page]:text-paper"
                  >
                    {item.label}
                  </Link>
                  {active && (
                    <motion.span
                      layoutId="dock-active"
                      className="absolute inset-0 rounded-[8px] border border-paper/25 bg-night-3"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <button
            ref={menuButton}
            type="button"
            className="flex h-11 items-center gap-2 rounded-[8px] px-4 text-[0.8125rem] font-medium text-paper/85 sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-2.5 w-4" aria-hidden>
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`}
              />
            </span>
            {open ? "Close" : "Menu"}
          </button>

          <Link
            href="/contact"
            className="ml-1 flex h-11 items-center gap-2 rounded-[8px] bg-signal px-4 text-[0.8125rem] font-semibold text-signal-ink transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.97]"
          >
            <span className="relative flex size-1.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-signal-ink/60" />
              <span className="relative size-1.5 rounded-full bg-signal-ink" />
            </span>
            Start a project
          </Link>
        </div>
      </nav>
    </>
  );
}
