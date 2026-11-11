import type { ShelfItem } from "./items";

/** Runtime canvas artwork for shelf cases and the wall — no external assets. */

const C = {
  paper: "#e9e9e6",
  ink: "#141414",
  night: "#0c0c0d",
  fog: "#a3a3a8",
  muted: "#5f5f5b",
  signal: "#ff5b1f",
  signalInk: "#1a0a03",
};

function fonts() {
  const css = getComputedStyle(document.documentElement);
  return {
    sans: css.getPropertyValue("--font-archivo").trim() || "Arial, sans-serif",
    mono: css.getPropertyValue("--font-geist-mono").trim() || "monospace",
  };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export const COVER = { w: 512, h: 736 };

export async function drawCover(item: ShelfItem, scale = 1) {
  const { sans, mono } = fonts();
  const cv = document.createElement("canvas");
  cv.width = COVER.w * scale;
  cv.height = COVER.h * scale;
  const ctx = cv.getContext("2d")!;
  ctx.scale(scale, scale);
  const pad = 32;
  const bg = { screen: C.night, ink: C.ink, paper: C.paper, signal: C.signal }[item.tone];
  const fg = { screen: C.paper, ink: C.paper, paper: C.ink, signal: C.signalInk }[item.tone];
  const sub = { screen: C.fog, ink: C.fog, paper: C.muted, signal: C.signalInk }[item.tone];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, COVER.w, COVER.h);

  // Header strip
  ctx.fillStyle = item.tone === "signal" ? C.ink : C.signal;
  ctx.fillRect(0, 0, COVER.w, 56);
  ctx.fillStyle = item.tone === "signal" ? C.paper : C.signalInk;
  ctx.font = `600 20px ${mono}`;
  ctx.textBaseline = "middle";
  ctx.fillText("LAUNCHLY", pad, 29);
  ctx.textAlign = "right";
  ctx.fillText(item.code, COVER.w - pad, 29);
  ctx.textAlign = "left";

  let top = 300;
  if (item.image) {
    try {
      const img = await loadImage(item.image);
      const h = 420;
      const s = Math.max(COVER.w / img.width, h / img.height);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 56, COVER.w, h);
      ctx.clip();
      ctx.drawImage(img, (COVER.w - img.width * s) / 2, 56, img.width * s, img.height * s);
      const g = ctx.createLinearGradient(0, 56 + h * 0.4, 0, 56 + h);
      g.addColorStop(0, "rgba(12,12,13,0)");
      g.addColorStop(1, "rgba(12,12,13,1)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 56, COVER.w, h);
      ctx.restore();
      top = 470;
    } catch {
      /* typographic fallback */
    }
  } else {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.fillStyle = fg;
    ctx.font = `800 320px ${sans}`;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(item.code.slice(2), pad - 16, 330);
    ctx.restore();
  }

  ctx.textBaseline = "top";
  ctx.fillStyle = sub;
  ctx.font = `500 20px ${mono}`;
  ctx.fillText(item.kicker.toUpperCase().slice(0, 34), pad, top);

  let size = item.image ? 66 : 72;
  let lines: string[] = [];
  const maxLines = item.image ? 2 : 4;
  do {
    ctx.font = `700 ${size}px ${sans}`;
    lines = wrap(ctx, item.title.toUpperCase(), COVER.w - pad * 2);
    size -= 4;
  } while ((lines.length > maxLines || lines.some((l) => ctx.measureText(l).width > COVER.w - pad * 2)) && size > 30);
  size += 4;
  ctx.fillStyle = fg;
  lines.forEach((l, i) => ctx.fillText(l, pad - 2, top + 36 + i * size * 0.92));

  // Footer: rule + barcode
  const fy = COVER.h - 80;
  ctx.fillStyle = item.tone === "paper" ? "rgba(20,20,20,.16)" : "rgba(255,255,255,.16)";
  ctx.fillRect(pad, fy - 14, COVER.w - pad * 2, 2);
  ctx.fillStyle = fg;
  let seed = [...item.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  for (let x = pad; x < pad + 150; ) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const bw = 1 + (seed % 4);
    if ((seed >> 4) % 3) ctx.fillRect(x, fy, bw, 46);
    x += bw + 2;
  }
  ctx.font = `600 18px ${mono}`;
  ctx.fillStyle = sub;
  ctx.textAlign = "right";
  ctx.fillText("SP · STEREO", COVER.w - pad, fy + 4);
  ctx.fillText("EST. LAUNCH", COVER.w - pad, fy + 28);
  ctx.textAlign = "left";

  if (item.placeholder) {
    ctx.fillStyle = C.signal;
    ctx.fillRect(COVER.w - 210, 74, 186, 38);
    ctx.fillStyle = C.signalInk;
    ctx.font = `700 18px ${mono}`;
    ctx.textBaseline = "middle";
    ctx.fillText("EXAMPLE ENTRY", COVER.w - 196, 94);
  }
  return cv;
}

/** Back of the case, seen when the viewer flips it over. */
export function drawBack(item: ShelfItem, scale = 2) {
  const { sans, mono } = fonts();
  const cv = document.createElement("canvas");
  cv.width = COVER.w * scale;
  cv.height = COVER.h * scale;
  const ctx = cv.getContext("2d")!;
  ctx.scale(scale, scale);
  const pad = 32;
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, COVER.w, COVER.h);
  ctx.fillStyle = C.signal;
  ctx.fillRect(0, COVER.h - 56, COVER.w, 56);
  ctx.fillStyle = C.signalInk;
  ctx.font = `600 20px ${mono}`;
  ctx.textBaseline = "middle";
  ctx.fillText("LAUNCHLY ARCHIVE", pad, COVER.h - 28);
  ctx.textAlign = "right";
  ctx.fillText(item.code, COVER.w - pad, COVER.h - 28);
  ctx.textAlign = "left";

  ctx.textBaseline = "top";
  ctx.fillStyle = C.fog;
  ctx.font = `500 18px ${mono}`;
  ctx.fillText(item.kicker.toUpperCase().slice(0, 36), pad, pad + 4);
  ctx.fillStyle = C.paper;
  ctx.font = `700 40px ${sans}`;
  wrap(ctx, item.title.toUpperCase(), COVER.w - pad * 2)
    .slice(0, 3)
    .forEach((l, i) => ctx.fillText(l, pad, pad + 40 + i * 40));

  ctx.font = `400 21px ${sans}`;
  ctx.fillStyle = "#cfcfcb";
  wrap(ctx, item.body, COVER.w - pad * 2)
    .slice(0, 9)
    .forEach((l, i) => ctx.fillText(l, pad, 230 + i * 30));

  ctx.font = `500 16px ${mono}`;
  let y = COVER.h - 210;
  for (const n of item.notes.slice(0, 4)) {
    ctx.fillStyle = "rgba(255,255,255,.14)";
    ctx.fillRect(pad, y - 10, COVER.w - pad * 2, 1);
    ctx.fillStyle = C.fog;
    ctx.fillText(n.label.toUpperCase(), pad, y);
    ctx.fillStyle = C.paper;
    ctx.textAlign = "right";
    ctx.fillText(n.value.toUpperCase().slice(0, 28), COVER.w - pad, y);
    ctx.textAlign = "left";
    y += 34;
  }
  return cv;
}

/** Spine artwork for the decorative cases. */
export function drawSpine(label: string, color: string, light: boolean) {
  const { sans } = fonts();
  const cv = document.createElement("canvas");
  cv.width = 96;
  cv.height = 736;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 96, 736);
  ctx.fillStyle = light ? C.ink : C.paper;
  ctx.globalAlpha = 0.85;
  ctx.save();
  ctx.translate(60, 690);
  ctx.rotate(-Math.PI / 2);
  ctx.font = `700 40px ${sans}`;
  ctx.fillText(label.toUpperCase(), 0, 0);
  ctx.restore();
  ctx.fillStyle = C.signal;
  ctx.globalAlpha = 1;
  ctx.fillRect(0, 24, 96, 22);
  return cv;
}

/** Back wall: perforated pegboard. */
export function drawPegboard() {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 128;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#34342f";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#121210";
  for (let y = 16; y < 128; y += 32)
    for (let x = 16; x < 128; x += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  return cv;
}

/** Orange header band with the archive title. */
export function drawBand() {
  const { sans, mono } = fonts();
  const cv = document.createElement("canvas");
  cv.width = 2048;
  cv.height = 160;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#c2481a";
  ctx.fillRect(0, 0, 2048, 160);
  ctx.fillStyle = C.signalInk;
  ctx.font = `italic 800 96px ${sans}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText("THE LAUNCH ARCHIVE", 1024, 86);
  ctx.font = `600 30px ${mono}`;
  ctx.textAlign = "left";
  ctx.fillText("WORK · SERVICES", 40, 86);
  ctx.textAlign = "right";
  ctx.fillText("OPEN 24H", 2008, 86);
  return cv;
}
