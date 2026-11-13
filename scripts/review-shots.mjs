// Dev helper: full-page screenshots of every page for visual review.
//   node scripts/review-shots.mjs <outDir> [baseUrl] [mobile]
import { chromium, devices } from "@playwright/test";
const out = process.argv[2];
const base = process.argv[3] || "http://localhost:3000";
const mobile = process.argv[4] === "mobile";
const pages = (process.argv[5] || "home:/,work:/work,case:/work/ogcw,services:/services,service:/services/build,process:/process,about:/about,contact:/contact,start:/start,account:/account,legal:/legal/privacy,404:/nope").split(",").map((s) => s.split(/:(.*)/s).slice(0, 2));
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext(mobile ? { ...devices["iPhone 13"] } : { viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem("launchly-storage-notice", "1"); } catch {} });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(`${page.url()} ${e.message}`));
page.on("console", (m) => m.type() === "error" && !/favicon|DevTools/.test(m.text()) && errs.push(`${page.url()} ${m.text().slice(0, 200)}`));
for (const [name, path] of pages) {
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.keyboard.press("Escape").catch(() => {});
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(180); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${mobile ? "m-" : ""}${name}.jpg`, fullPage: true, type: "jpeg", quality: 62 });
  console.log(name, h);
}
console.log("errors:", JSON.stringify(errs, null, 1));
await b.close();
