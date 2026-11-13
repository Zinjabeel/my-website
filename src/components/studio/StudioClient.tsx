"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Info = { finalUrl: string; title: string; description: string; embeddable: boolean; embedReason: string };

const input =
  "h-12 w-full rounded-[10px] border hairline bg-paper-2 px-4 outline-none focus:border-ink focus:shadow-[0_0_0_3px_rgb(255_91_31/0.25)]";

const list = (s: string) =>
  s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);

export function StudioClient() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState<"" | "inspect" | "save">("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ slug: string; captured: boolean } | null>(null);
  const [form, setForm] = useState({ name: "", sector: "", year: String(new Date().getFullYear()), summary: "", about: "", built: "", stack: "", services: "" });

  async function inspect(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo(null);
    setDone(null);
    setBusy("inspect");
    const res = await fetch("/api/studio/inspect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    const json = await res.json();
    setBusy("");
    if (!json.ok) return setError(json.error);
    setInfo(json.info);
    setForm((f) => ({ ...f, name: json.info.title.split(/[|–—-]/)[0].trim() || f.name, summary: json.info.description || f.summary }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!info) return;
    setError("");
    setBusy("save");
    const res = await fetch("/api/studio/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, url: info.finalUrl, built: list(form.built), stack: list(form.stack), services: list(form.services) }),
    });
    const json = await res.json();
    setBusy("");
    if (!json.ok) return setError(json.error);
    setDone({ slug: json.slug, captured: json.captured });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="wrap max-w-5xl py-16">
      <p className="label text-muted">(Studio — local development only)</p>
      <h1 className="display h-page mt-4">Add a project</h1>
      <p className="mt-4 max-w-xl text-muted">
        Paste a website URL. We check whether it can be embedded, read its title and description, capture desktop and mobile
        screenshots, and add it to <code className="label">src/content/projects.json</code>. Commit that file to publish.
      </p>

      <form onSubmit={inspect} className="mt-10 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="url" className="sr-only">
          Website URL
        </label>
        <input id="url" type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} className={input} />
        <button type="submit" disabled={!!busy} className="h-12 shrink-0 rounded-[10px] bg-ink px-6 font-semibold text-paper disabled:opacity-60">
          {busy === "inspect" ? <Loader2 className="mx-auto size-4 animate-spin" aria-label="Inspecting" /> : "Inspect"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 rounded-[10px] border border-danger/40 bg-danger/5 px-4 py-3 text-danger">
          {error}
        </p>
      )}

      {info && !done && (
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="label text-muted">Preview</p>
            <div className="mt-3 overflow-hidden rounded-[10px] bg-night p-3">
              {info.embeddable ? (
                <iframe
                  src={info.finalUrl}
                  title="Live preview"
                  sandbox="allow-scripts allow-same-origin"
                  referrerPolicy="no-referrer"
                  className="aspect-[16/11] w-full rounded bg-white"
                />
              ) : (
                <div className="grid aspect-[16/11] place-items-center rounded bg-night-2 p-6 text-center text-fog">
                  <p className="label">This site blocks embedding — the portfolio will use screenshots.</p>
                </div>
              )}
            </div>
            <p className="label mt-3 text-muted">
              Embeddable: <strong className={info.embeddable ? "text-success" : "text-danger"}>{info.embeddable ? "yes" : "no"}</strong> — {info.embedReason}
            </p>
          </div>

          <form onSubmit={save} className="space-y-4">
            {(
              [
                ["name", "Project name"],
                ["sector", "Sector (e.g. Retail)"],
                ["year", "Year"],
              ] as const
            ).map(([k, l]) => (
              <div key={k}>
                <label htmlFor={k} className="mb-1.5 block text-[0.9rem] font-medium">
                  {l}
                </label>
                <input id={k} required value={form[k]} onChange={set(k)} className={input} />
              </div>
            ))}
            {(
              [
                ["summary", "Short description", true],
                ["about", "What the website is about", false],
                ["built", "What we built (one per line)", false],
                ["stack", "Technologies (comma separated)", false],
                ["services", "Services (comma separated)", false],
              ] as const
            ).map(([k, l, req]) => (
              <div key={k}>
                <label htmlFor={k} className="mb-1.5 block text-[0.9rem] font-medium">
                  {l}
                </label>
                <textarea id={k} required={req} rows={k === "built" || k === "about" ? 3 : 2} value={form[k]} onChange={set(k)} className={`${input} h-auto py-3`} />
              </div>
            ))}
            <button type="submit" disabled={!!busy} className="h-12 w-full rounded-[10px] bg-signal font-semibold text-signal-ink disabled:opacity-60">
              {busy === "save" ? "Adding & capturing screenshots… (up to a minute)" : "Add to portfolio"}
            </button>
          </form>
        </div>
      )}

      {done && (
        <div role="status" className="mt-10 rounded-[10px] bg-night p-8 text-paper">
          <p className="display text-[2rem]">Project added.</p>
          <p className="mt-2 text-fog">
            {done.captured ? "Screenshots captured." : "Screenshots could not be captured — run `npm run screenshots` later."} The page may take a
            moment to appear while the dev server reloads.
          </p>
          <Link href={`/work/${done.slug}`} className="label mt-6 inline-block text-signal underline">
            Open /work/{done.slug}
          </Link>
        </div>
      )}
    </div>
  );
}
