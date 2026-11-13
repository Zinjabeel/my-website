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

/** Stores the message in Supabase (table contact_messages). Insert-only by row-level security. */
async function store(data: ContactInput): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return false;
  const res = await fetch(`${url}/rest/v1/contact_messages`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      company: data.company || null,
      project_type: data.projectType,
      budget: data.budget || null,
      message: data.message,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
  return true;
}

/** Emails the message through Resend, when configured. */
async function email(data: ContactInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) return false;
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
      subject: `New message — ${data.name}${data.company ? ` (${data.company})` : ""}`,
      html: `<h2>New message from the website</h2><table>${rows}</table><p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>`,
      text: `${data.name} <${data.email}>
Company: ${data.company || "—"}
Type: ${data.projectType}
Budget: ${data.budget || "—"}

${data.message}`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  return true;
}

/**
 * A message counts as delivered once it is stored OR emailed. Both run when both are configured;
 * if one fails the other still carries the message.
 */
async function deliver(data: ContactInput): Promise<"delivered" | "saved" | "unconfigured"> {
  const results = await Promise.allSettled([store(data), email(data)]);
  const failures = results.filter((r) => r.status === "rejected") as PromiseRejectedResult[];
  failures.forEach((f) => console.error("[contact]", f.reason));
  if (results.some((r) => r.status === "fulfilled" && r.value)) return "delivered";
  if (failures.length) throw failures[0].reason;

  // Nothing configured: keep messages locally during development.
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
      console.error("[contact] Neither Supabase nor Resend is configured — see .env.example.");
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
