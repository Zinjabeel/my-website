"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildShelfItems, type ShelfItem } from "./items";
import { projects } from "@/content/projects";

const ShelfScene = dynamic(() => import("./ShelfScene"), { ssr: false });
const HoloViewer = dynamic(() => import("@/components/holo/HoloViewer").then((m) => m.HoloViewer), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Timecode({ running }: { running: boolean }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const fmt = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return <span className="tabular-nums">SP {fmt}</span>;
}

/**
 * Hero: a lit shelf of cases in 3D. Hover pulls a case out, click opens it.
 * Falls back to a still frame for reduced motion / no WebGL. Every case is also a normal link below.
 */
export function HeroShelf() {
  const router = useRouter();
  const items = useMemo(() => buildShelfItems(), []);
  const frame = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"pending" | "3d" | "still">("pending");
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const current = items.find((i) => i.id === hovered);
  const poster = projects.find((p) => p.media)?.media?.desktop;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(!reduce && supportsWebGL() ? "3d" : "still");
  }, []);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.cursor = current ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [current]);

  const [viewing, setViewing] = useState<ShelfItem | null>(null);
  const onSelect = useCallback(
    (item: ShelfItem) => {
      // 3D path opens the holographic viewer; anything else goes straight to the page.
      if (mode === "3d") {
        setHovered(null);
        setViewing(item);
      } else router.push(item.href);
    },
    [mode, router],
  );
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div>
      <div
        ref={frame}
        className="crt relative aspect-[4/5] w-full overflow-hidden rounded-[8px] border-[1.5px] border-night-3 bg-night text-paper sm:aspect-[16/10] lg:aspect-[16/7.6]"
      >
        {/* Still frame: shown while loading, or as the fallback */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${mode === "3d" && ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 90vw"
              className="object-cover opacity-35 blur-[1px]"
            />
          )}
          <div className="absolute inset-0 grid place-items-center">
            <p className="label text-fog">{mode === "still" ? "The Launch Archive" : "Loading tape…"}</p>
          </div>
        </div>

        {mode === "3d" && (
          <div className="absolute inset-0">
            <ShelfScene
              items={items}
              hovered={hovered}
              onHover={setHovered}
              onSelect={onSelect}
              onReady={onReady}
              active={inView && playing && !viewing}
            />
          </div>
        )}

        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-2/5 bg-gradient-to-t from-night via-night/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-24 bg-gradient-to-b from-night/80 to-transparent" />
        {/* VHS HUD */}
        <div className="pointer-events-none absolute inset-0 z-[3] p-4 font-mono text-[0.8rem] uppercase tracking-wide sm:p-6 sm:text-[0.95rem]">
          <div className="flex items-start justify-between [text-shadow:1px_0_rgb(255_0_60/0.55),-1px_0_rgb(0_200_255/0.55)]">
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              className="pointer-events-auto flex items-center gap-2 rounded px-1 hover:text-signal"
              aria-label={playing ? "Pause the 3D shelf" : "Play the 3D shelf"}
              disabled={mode !== "3d"}
            >
              {playing ? "Play ▶" : "Pause ❚❚"}
            </button>
            <Timecode running={playing && inView} />
          </div>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
            <p aria-live="polite" className="min-h-[2.6em] max-w-[70%]">
              {current ? (
                <>
                  <span className="block text-signal">{current.code} — {current.kicker}</span>
                  <span className="block text-paper">{current.title}</span>
                </>
              ) : (
                <span className="text-fog">{mode === "3d" ? "Move to look around · click a case to pull it out" : "Pick a case below"}</span>
              )}
            </p>
            <span className="hidden text-fog sm:block">Ch. 01</span>
          </div>
        </div>
      </div>

      {/* Accessible index of everything on the shelf (also the touch/no-3D path) */}
      <nav aria-label="On the shelf" className="-mx-[var(--gutter)] mt-4 sm:mx-0">
        <ul className="flex gap-2 overflow-x-auto px-[var(--gutter)] pb-2 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {items.map((it) => (
            <li key={it.id}>
              <Link
                href={it.href}
                onPointerEnter={() => setHovered(it.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(it.id)}
                onBlur={() => setHovered(null)}
                className={`label inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-[4px] border px-3 transition-colors ${
                  hovered === it.id ? "border-signal bg-signal text-signal-ink" : "border-night-3 text-paper hover:border-paper"
                }`}
              >
                <span className={hovered === it.id ? "text-signal-ink/70" : "text-fog"}>{it.code}</span>
                {it.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {viewing && <HoloViewer item={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
