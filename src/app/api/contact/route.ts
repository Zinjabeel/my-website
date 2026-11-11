import { NextResponse, type NextRequest } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { contactSchema, escapeHtml, fieldErrors, type ContactInput } from "@/lib/contact";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MIN_FILL_MS = 2500;

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

async function deliver(data: ContactInput): Promise<"sent" | "saved" | "unconfigured"> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (key && to && from) {
    const rows = [
      ["Name", data.name],
      ["Email", data.email],
      ["Company", data.company || "—"],
      ["Project type", data.projectType],
      ["Budget", data.budget || "—"],
    ]
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td>${escapeHtml(v)}</td></tr>`)
      .join("");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: data.email,
        subject: `New enquiry — ${data.name}${data.company ? ` (${data.company})` : ""}`,
        html: `<h2>New project enquiry</h2><table>${rows}</table><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
        text: `${data.name} <${data.email}>\nCompany: ${data.company || "—"}\nType: ${data.projectType}\nBudget: ${data.budget || "—"}\n\n${data.message}`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
    return "sent";
  }

  // No email provider configured: keep enquiries locally during development.
  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), ".submissions");
    await mkdir(dir, { recursive: true });
    const { website: _hp, startedAt: _t, ...clean } = data;
    await writeFile(path.join(dir, `${Date.now()}.json`), JSON.stringify({ ...clean, receivedAt: new Date().toISOString() }, null, 2));
    return "saved";
  }
  return "unconfigured";
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  }
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ ok: false, error: "Unsupported content type." }, { status: 415 });
  }

  const max = process.env.NODE_ENV === "production" ? 5 : 200; // strict in production, roomy for local testing
  const limit = rateLimit(`contact:${clientIp(req)}`, max, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages in a short time. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > 20_000) return NextResponse.json({ ok: false, error: "Message too large." }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    // Spam signals get a quiet "success" so bots learn nothing.
    if (errors.website) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fields: errors }, { status: 422 });
  }
  if (Date.now() - parsed.data.startedAt < MIN_FILL_MS) return NextResponse.json({ ok: true });

  try {
    const result = await deliver(parsed.data);
    if (result === "unconfigured") {
      console.error("[contact] RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL are not set.");
      return NextResponse.json(
        { ok: false, error: "Our contact form is temporarily unavailable. Please email us directly." },
        { status: 503 },
      );
    }
    return NextResponse.json({ ok: true, delivery: result });
  } catch (err) {
    console.error("[contact] delivery failed:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message right now. Please try again in a moment." },
      { status: 502 },
    );
  }
}
