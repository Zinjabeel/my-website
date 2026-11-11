import { NextResponse, type NextRequest } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { z } from "zod";
import { projectSchema } from "@/content/projects";
import { assertPublicUrl, inspectSite } from "@/lib/inspect-site";

export const runtime = "nodejs";

const DATA = path.join(process.cwd(), "src", "content", "projects.json");

const input = z.object({
  url: z.string().url(),
  name: z.string().trim().min(1).max(80),
  sector: z.string().trim().min(1).max(60),
  year: z.string().trim().regex(/^\d{4}$/),
  summary: z.string().trim().min(10).max(300),
  about: z.string().trim().max(1500).optional().default(""),
  built: z.array(z.string().trim().min(1)).max(12).default([]),
  stack: z.array(z.string().trim().min(1)).max(20).default([]),
  services: z.array(z.string().trim().min(1)).max(10).default([]),
});

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "project";
}

function runScreenshots(slug: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(process.execPath, [path.join(process.cwd(), "scripts", "screenshot-projects.mjs"), slug], {
      cwd: process.cwd(),
      stdio: "inherit",
    });
    child.on("exit", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

/** Dev-only: add a project to projects.json and capture its screenshots. */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });

  const parsed = input.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") }, { status: 422 });
  }
  const d = parsed.data;

  try {
    await assertPublicUrl(d.url);
    const info = await inspectSite(d.url);
    const list = JSON.parse(await readFile(DATA, "utf8")) as unknown[];
    const existing = new Set((list as { slug: string }[]).map((p) => p.slug));
    let slug = slugify(d.name);
    for (let i = 2; existing.has(slug); i++) slug = `${slugify(d.name)}-${i}`;

    const project = projectSchema.parse({
      slug,
      name: d.name,
      url: info.finalUrl,
      placeholder: false,
      year: d.year,
      sector: d.sector,
      summary: d.summary,
      about: d.about || d.summary,
      built: d.built,
      stack: d.stack,
      features: [],
      services: d.services,
      embeddable: info.embeddable,
      accent: info.themeColor,
      media: null,
      addedAt: new Date().toISOString().slice(0, 10),
    });

    list.unshift(project);
    await writeFile(DATA, JSON.stringify(list, null, 2) + "\n");
    const captured = await runScreenshots(slug);
    return NextResponse.json({ ok: true, slug, captured, embeddable: info.embeddable, embedReason: info.embedReason });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not add the project." }, { status: 422 });
  }
}
