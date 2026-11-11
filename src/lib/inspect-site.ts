import { lookup } from "node:dns/promises";
import net from "node:net";

/** Server-side website inspection used by the dev studio. Guards against SSRF to private networks. */

function isPrivateIp(ip: string) {
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7));
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http(s) URLs are supported.");
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed.");
  const addrs = await lookup(url.hostname, { all: true }).catch(() => {
    throw new Error("Couldn't resolve that domain.");
  });
  if (addrs.some((a) => isPrivateIp(a.address))) throw new Error("Private or local addresses are not allowed.");
  return url;
}

export type Inspection = {
  finalUrl: string;
  title: string;
  description: string;
  themeColor?: string;
  embeddable: boolean;
  embedReason: string;
};

/** Decide whether a site may be framed, based on X-Frame-Options and CSP frame-ancestors. */
export function checkEmbeddable(headers: Headers): { embeddable: boolean; reason: string } {
  const xfo = headers.get("x-frame-options")?.toLowerCase();
  if (xfo && (xfo.includes("deny") || xfo.includes("sameorigin"))) {
    return { embeddable: false, reason: `X-Frame-Options: ${xfo.toUpperCase()}` };
  }
  const csp = headers.get("content-security-policy") ?? "";
  const fa = csp.split(";").map((d) => d.trim()).find((d) => d.toLowerCase().startsWith("frame-ancestors"));
  if (fa) {
    const sources = fa.split(/\s+/).slice(1);
    if (!sources.some((s) => s === "*" || s === "https:")) {
      return { embeddable: false, reason: `CSP ${fa}` };
    }
  }
  return { embeddable: true, reason: "No framing restrictions found" };
}

function pick(html: string, re: RegExp) {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export async function inspectSite(raw: string): Promise<Inspection> {
  let url = await assertPublicUrl(raw);
  let res: Response | null = null;
  for (let hop = 0; hop < 4; hop++) {
    res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "LaunchlyPortfolioBot/1.0", Accept: "text/html" },
      signal: AbortSignal.timeout(10000),
    });
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      url = await assertPublicUrl(new URL(loc, url).toString()); // re-check every hop
      continue;
    }
    break;
  }
  if (!res || !res.ok) throw new Error(`The site responded with status ${res?.status ?? "unknown"}.`);

  const reader = res.body?.getReader();
  let html = "";
  if (reader) {
    const dec = new TextDecoder();
    while (html.length < 400_000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += dec.decode(value, { stream: true });
    }
    await reader.cancel().catch(() => {});
  }

  const { embeddable, reason } = checkEmbeddable(res.headers);
  return {
    finalUrl: url.toString(),
    title: decode(
      pick(html, /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)/i) ||
        pick(html, /<title[^>]*>([^<]+)<\/title>/i),
    ),
    description: decode(
      pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) ||
        pick(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i),
    ),
    themeColor: pick(html, /<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{6})/i) || undefined,
    embeddable,
    embedReason: reason,
  };
}
