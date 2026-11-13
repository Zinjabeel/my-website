"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Menu, User as UserIcon, X } from "lucide-react";
import { site } from "@/content/site";
import { useAuth } from "@/components/auth/AuthProvider";
import { Wordmark } from "./Logo";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The site frame: logo, section links in ruled cells, account, and the one primary action.
 * Sticky on every page so navigation is always in the same place.
 */
export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const { user, ready, displayName, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    window.__lenis?.stop();
    sheet.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prev;
      window.__lenis?.start();
    };
  }, [open]);

  if (pathname.startsWith("/studio")) return null;

  const account = user ? (
    <Link
      href="/account"
      aria-label={`Your account (${displayName})`}
      className="grid size-10 place-items-center rounded-full bg-ink text-[0.9rem] font-bold uppercase text-paper transition-colors hover:bg-signal hover:text-signal-ink"
    >
      {displayName.charAt(0) || <UserIcon className="size-4" aria-hidden />}
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => openAuth("login")}
      aria-label="Log in or create an account"
      className={`icon-btn transition-opacity ${ready ? "opacity-100" : "opacity-60"}`}
    >
      <UserIcon className="size-[1.05rem]" aria-hidden />
    </button>
  );

  return (
    <>
      <header className="sticky top-0 z-[60] border-b border-ink bg-paper">
        <div className="wrap flex h-[var(--header-h)] items-stretch justify-between gap-4">
          <Link href="/" aria-label="Launchly — home" className="flex items-center text-[1.3rem]">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="hidden lg:flex">
            <ul className="flex items-stretch border-l hairline">
              {site.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href} className="flex border-r hairline">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="eyebrow relative flex items-center px-5 transition-colors hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper xl:px-6"
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2.5">
            {account}
            <Link href="/start" className="btn btn-primary btn-sm hidden sm:inline-flex">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              Start a project
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="icon-btn lg:hidden"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-[1.1rem]" aria-hidden /> : <Menu className="size-[1.1rem]" aria-hidden />}
            </button>
          </div>
        </div>
        <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-signal" />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={sheet}
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="band-ink fixed inset-x-0 bottom-0 top-[var(--header-h)] z-[55] flex flex-col overflow-y-auto lg:hidden"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav aria-label="Mobile" className="wrap flex-1 py-6">
              <ul>
                {[{ href: "/", label: "Home" }, ...site.nav].map((item, i) => (
                  <li key={item.href} className="border-b border-night-3">
                    <Link
                      href={item.href}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="display flex items-baseline justify-between py-4 text-[2rem] aria-[current=page]:text-signal"
                    >
                      {item.label}
                      <span className="label text-fog">{String(i + 1).padStart(2, "0")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="wrap grid gap-3 pb-8">
              <Link href="/start" className="btn btn-signal btn-block">
                Start a project <ArrowRight className="size-4" aria-hidden />
              </Link>
              {user ? (
                <Link href="/account" className="btn btn-outline btn-block">
                  Your account
                </Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={() => {
                    setOpen(false);
                    openAuth("login");
                  }}
                >
                  Log in / Create account
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
