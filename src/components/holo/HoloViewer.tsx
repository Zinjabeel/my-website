"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import type { ShelfChoice, ShelfItem } from "@/components/shelf/items";
import type { HoloMode } from "./HoloScene";

const HoloScene = dynamic(() => import("./HoloScene"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

/** Marks the next page as a "zoom" arrival so it skips its usual wipe (see ZoomArrival). */
function markZoomArrival() {
  window.__zoomArrival = true;
}

/**
 * Full-screen holographic viewer for one shelf case.
 * Drag to turn it, move to tilt it under the light, click it to reveal notes and choices.
 * Picking a destination zooms the case into the camera and fades into the next page.
 */
export function HoloViewer({ item, onClose }: { item: ShelfItem; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<HoloMode>("enter");
  const [ready, setReady] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [fade, setFade] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });
  const yaw = useRef({ value: 0, vel: 0, dragging: false });
  const lastX = useRef<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const firstChoice = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const open = mode === "open";

  // Lock the page, remember focus, listen for pointer + keys.
  useEffect(() => {
    opener.current = document.activeElement;
    window.__lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const mq = window.matchMedia("(max-width: 767px)");
    setNarrow(mq.matches);
    closeBtn.current?.focus();

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      if (yaw.current.dragging) {
        const dx = lastX.current === null ? 0 : e.clientX - lastX.current;
        yaw.current.value += dx * 0.012;
        yaw.current.vel = dx * 0.012;
      }
      lastX.current = e.clientX;
    };
    const onUp = () => {
      yaw.current.dragging = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.style.overflow = prevOverflow;
      window.__lenis?.start();
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  // Finish the entrance.
  useEffect(() => {
    if (!ready || mode !== "enter") return;
    const t = setTimeout(() => setMode("idle"), 1100);
    return () => clearTimeout(t);
  }, [ready, mode]);

  useEffect(() => {
    if (open) {
      item.choices.forEach((c) => !c.external && router.prefetch(c.href));
      const t = setTimeout(() => firstChoice.current?.focus(), 450);
      return () => clearTimeout(t);
    }
  }, [open, item, router]);

  const close = useCallback(() => {
    if (mode === "launch") return;
    onClose();
  }, [mode, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (open) setMode("idle");
        else close();
      }
      if (e.key === "ArrowLeft") yaw.current.vel = -0.09;
      if (e.key === "ArrowRight") yaw.current.vel = 0.09;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const toggleOpen = useCallback(() => setMode((m) => (m === "open" ? "idle" : m === "idle" ? "open" : m)), []);

  const choose = (c: ShelfChoice) => {
    if (c.external) {
      window.open(c.href, "_blank", "noopener,noreferrer");
      return;
    }
    setMode("launch");
    setTimeout(() => setFade(true), 260);
    setTimeout(() => {
      markZoomArrival();
      router.push(c.href);
    }, 880);
  };

  const notesLeft = item.notes.slice(0, 2);
  const notesRight = item.notes.slice(2);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="holo-title"
      className="fixed inset-0 z-[80] overflow-hidden bg-night text-paper"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !open) close();
      }}
    >
      {/* Atmosphere */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background:
            "radial-gradient(60% 45% at 50% 108%, rgb(255 91 31 / 0.38), transparent 70%), radial-gradient(40% 35% at 50% 45%, rgb(255 255 255 / 0.05), transparent 70%), radial-gradient(120% 80% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.7))",
        }}
      />
      <div aria-hidden className="crt pointer-events-none absolute inset-0" />

      {/* 3D */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <HoloScene
          item={item}
          mode={mode}
          pointer={pointer}
          yaw={yaw}
          narrow={narrow}
          onReady={() => setReady(true)}
          onCaseClick={toggleOpen}
        />
      </motion.div>

      {!ready && (
        <div className="absolute inset-0 grid place-items-center">
          <p className="label text-fog">Pulling {item.code} from the shelf…</p>
        </div>
      )}

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-5 font-mono text-[0.8rem] uppercase tracking-wide sm:p-8">
        <div className="[text-shadow:1px_0_rgb(255_0_60/0.5),-1px_0_rgb(0_200_255/0.5)]">
          <p>Play ▶ — {item.code}</p>
          <p className="mt-1 text-fog">The Launch Archive</p>
        </div>
        <button
          ref={closeBtn}
          type="button"
          onClick={close}
          className="pointer-events-auto flex h-11 items-center gap-2 rounded-full border border-paper/20 bg-night/60 pl-4 pr-3 text-paper backdrop-blur transition-colors hover:border-paper/60"
        >
          Close <span className="text-fog">Esc</span>
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* Side notes — appear when the case is clicked */}
      <AnimatePresence>
        {open && (
          <>
            <motion.aside
              key="left"
              className="pointer-events-none absolute left-5 top-1/2 z-10 hidden w-[min(25vw,340px)] -translate-y-1/2 md:left-10 md:block"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
            >
              {[
                <p key="k" className="label text-signal">
                  {item.code} — {item.kicker}
                </p>,
                <h2 key="t" id="holo-title" className="headline mt-4 text-[clamp(2rem,3vw,3rem)]">
                  {item.title}
                </h2>,
                <p key="b" className="mt-5 text-[1rem] leading-relaxed text-fog">
                  {item.body}
                </p>,
                <dl key="n" className="mt-8 border-t border-paper/15">
                  {notesLeft.map((n) => (
                    <div key={n.label} className="flex justify-between gap-4 border-b border-paper/15 py-2.5">
                      <dt className="label text-fog">{n.label}</dt>
                      <dd className="label text-right">{n.value}</dd>
                    </div>
                  ))}
                </dl>,
              ].map((el, i) => (
                <motion.div
                  key={i}
                  variants={{ hidden: { opacity: 0, x: -24, filter: "blur(6px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)" } }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  {el}
                </motion.div>
              ))}
            </motion.aside>

            <motion.aside
              key="right"
              className="absolute bottom-24 left-4 right-4 z-10 md:bottom-auto md:left-auto md:right-10 md:top-1/2 md:w-[min(28vw,380px)] md:-translate-y-1/2"
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } }, hidden: {} }}
            >
              <motion.div
                className="md:hidden"
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <p className="label text-signal">
                  {item.code} — {item.kicker}
                </p>
                <p className="headline mt-2 text-[1.9rem]">{item.title}</p>
              </motion.div>
              <motion.dl
                className="hidden border-t border-paper/15 md:block"
                variants={{ hidden: { opacity: 0, x: 24 }, show: { opacity: 1, x: 0 } }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                {notesRight.map((n) => (
                  <div key={n.label} className="flex justify-between gap-4 border-b border-paper/15 py-2.5">
                    <dt className="label text-fog">{n.label}</dt>
                    <dd className="label text-right">{n.value}</dd>
                  </div>
                ))}
              </motion.dl>
              <motion.p
                className="label mt-5 text-fog md:mt-10"
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                Where to?
              </motion.p>
              <ul className="mt-3 space-y-2">
                {item.choices.map((c, i) => (
                  <motion.li
                    key={c.label}
                    variants={{ hidden: { opacity: 0, x: 30, filter: "blur(6px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)" } }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    <button
                      ref={i === 0 ? firstChoice : undefined}
                      type="button"
                      onClick={() => choose(c)}
                      className={`group flex w-full items-center justify-between gap-4 rounded-[10px] border px-4 py-3.5 text-left transition-[background-color,border-color,color,transform] duration-300 active:scale-[0.98] ${
                        i === 0
                          ? "border-signal bg-signal text-signal-ink hover:brightness-110"
                          : "border-paper/20 bg-night/50 backdrop-blur hover:border-paper hover:bg-paper hover:text-ink"
                      }`}
                    >
                      <span>
                        <span className="block text-[1.02rem] font-semibold tracking-[-0.01em]">{c.label}</span>
                        <span className={`label mt-0.5 block ${i === 0 ? "text-signal-ink/70" : "text-fog group-hover:text-muted"}`}>
                          {c.hint}
                          {c.external && " ↗"}
                        </span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {!open && (
        <h2 id="holo-title" className="sr-only">
          {item.title}
        </h2>
      )}

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-8">
        <p className="label hidden text-fog sm:block">{open ? "Drag to turn · Esc to go back" : "Drag to turn · Move to catch the light"}</p>
        <button
          type="button"
          onClick={toggleOpen}
          disabled={mode === "enter" || mode === "launch"}
          aria-expanded={open}
          className="label mx-auto flex h-11 items-center gap-2 rounded-full border border-paper/25 bg-night/60 px-5 text-paper backdrop-blur transition-colors hover:border-signal hover:text-signal disabled:opacity-0 sm:mx-0"
        >
          <span className="relative flex size-1.5" aria-hidden>
            <span className="absolute inset-0 animate-ping rounded-full bg-signal/70" />
            <span className="relative size-1.5 rounded-full bg-signal" />
          </span>
          {open ? "Hide details" : "Click the case — or here"}
        </button>
      </div>

      {/* Zoom-into-page fade */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 bg-paper"
        initial={{ opacity: 0 }}
        animate={{ opacity: fade ? 1 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>,
    document.body,
  );
}
