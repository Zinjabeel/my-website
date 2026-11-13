// Dev helper: viewport-sized crops at given scroll offsets.  node scripts/review-crops.mjs <out> <path> <name> <y1,y2,...> [mobile]
import { chromium, devices } from "@playwright/test";
const [out, path, name, ys, mode] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext(mode === "mobile" ? { ...devices["iPhone 13"] } : { viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem("launchly-storage-notice", "1"); } catch {} });
const page = await ctx.newPage();
await page.goto("http://localhost:3000" + path, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3500);
await page.keyboard.press("Escape").catch(() => {});
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
for (const y of ys.split(",")) {
  await page.evaluate((y) => window.scrollTo(0, Number(y)), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/${name}-${y}.jpg`, type: "jpeg", quality: 72 });
}
await b.close();
