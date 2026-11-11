"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Lock, Monitor, Smartphone } from "lucide-react";
import { hostOf, type Project } from "@/content/projects";

type View = "screenshot" | "live";
type Device = "desktop" | "mobile";

/**
 * Large interactive website preview inside a browser frame.
 * - Screenshot: the full-page capture, scrollable inside the frame.
 * - Live: the real site in a sandboxed iframe — offered only when the site allows embedding
 *   (checked when the project was added). If it fails to load, we fall back to the screenshot.
 */
export function ProjectPreview({ project }: { project: Project }) {
  const [view, setView] = useState<View>("screenshot");
  const [device, setDevice] = useState<Device>("desktop");
  const [liveState, setLiveState] = useState<"loading" | "loaded" | "failed">("loading");

  useEffect(() => {
    if (view !== "live") return;
    setLiveState("loading");
    const t = setTimeout(() => setLiveState((s) => (s === "loading" ? "failed" : s)), 12000);
    return () => clearTimeout(t);
  }, [view, device]);

  const media = project.media;
  const shot = device === "mobile" ? media?.mobile : media?.full ?? media?.desktop;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Preview mode" className="flex rounded-[10px] border hairline bg-paper-2 p-1">
          {(["screenshot", "live"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              disabled={v === "live" && !project.embeddable}
              onClick={() => setView(v)}
              className="label h-9 rounded-[7px] px-3.5 transition-colors aria-pressed:bg-ink aria-pressed:text-paper disabled:cursor-not-allowed disabled:opacity-40"
              title={v === "live" && !project.embeddable ? "This website doesn't allow being embedded" : undefined}
            >
              {v === "screenshot" ? "Screenshot" : "Live site"}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Device" className="flex rounded-[10px] border hairline bg-paper-2 p-1">
          {(
            [
              ["desktop", Monitor],
              ["mobile", Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              aria-label={d === "desktop" ? "Desktop view" : "Mobile view"}
              onClick={() => setDevice(d)}
              className="grid h-9 w-11 place-items-center rounded-[7px] transition-colors aria-pressed:bg-ink aria-pressed:text-paper"
            >
              <Icon className="size-4" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[12px] bg-night p-3 sm:p-[3.5%]">
        <div
          className={`mx-auto overflow-hidden rounded-[8px] bg-night-2 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] transition-[max-width] duration-700 ease-[var(--ease-out-expo)] ${
            device === "mobile" ? "max-w-[390px]" : "max-w-[1280px]"
          }`}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-night-3 bg-night-2 px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-night-3" />
              <span className="size-2.5 rounded-full bg-night-3" />
              <span className="size-2.5 rounded-full bg-night-3" />
            </span>
            <span className="label flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate rounded-md bg-night px-3 py-1.5 text-fog">
              <Lock className="size-3 shrink-0" aria-hidden />
              <span className="truncate normal-case">{hostOf(project.url)}</span>
            </span>
            <span className="w-10" aria-hidden />
          </div>

          <div className={`relative ${device === "mobile" ? "h-[min(78vh,760px)]" : "h-[min(78vh,820px)]"}`}>
            {view === "live" && project.embeddable ? (
              <>
                {liveState !== "loaded" && (
                  <div className="absolute inset-0 grid place-items-center text-center text-fog">
                    {liveState === "loading" ? (
                      <p className="label">Loading the live site…</p>
                    ) : (
                      <div className="px-6">
                        <p className="label">The live site didn&apos;t load here.</p>
                        <button type="button" onClick={() => setView("screenshot")} className="label mt-3 text-signal underline">
                          Show the screenshot instead
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <iframe
                  key={device}
                  src={project.url}
                  title={`Live preview of ${project.name}`}
                  className={`relative size-full bg-white transition-opacity duration-500 ${liveState === "loaded" ? "opacity-100" : "opacity-0"}`}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  allow=""
                  onLoad={() => setLiveState("loaded")}
                />
              </>
            ) : shot ? (
              <div className="size-full overflow-y-auto overscroll-contain" data-lenis-prevent tabIndex={0} aria-label="Scrollable screenshot">
                <Image
                  src={shot}
                  alt={`Full-page screenshot of the ${project.name} website (${device})`}
                  width={device === "mobile" ? 780 : 1440}
                  height={device === "mobile" ? 1688 : media?.fullHeight ?? 900}
                  sizes={device === "mobile" ? "390px" : "(max-width: 1280px) 92vw, 1280px"}
                  className="h-auto w-full"
                  priority
                />
              </div>
            ) : (
              <div className="grid size-full place-items-center">
                <p className="label text-fog">No preview captured yet — run `npm run screenshots`.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="label mt-3 text-muted">
        {view === "screenshot" ? "Scroll inside the frame to explore the full page." : "Live site, sandboxed. Some features may be limited when embedded."}
      </p>
    </div>
  );
}
