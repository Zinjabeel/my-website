import { NextResponse, type NextRequest } from "next/server";
import { inspectSite } from "@/lib/inspect-site";

export const runtime = "nodejs";

/** Dev-only: inspect a website URL (title, description, whether it can be embedded). */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ ok: false, error: "Enter a website URL." }, { status: 400 });
  try {
    const info = await inspectSite(url);
    return NextResponse.json({ ok: true, info });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Inspection failed." }, { status: 422 });
  }
}
