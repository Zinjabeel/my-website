#!/usr/bin/env node
/**
 * Captures preview screenshots for portfolio projects.
 *
 *   npm run screenshots              → every project in src/content/projects.json
 *   npm run screenshots -- my-slug   → only the given slug(s)
 *
 * Output: public/projects/<slug>/{desktop,full,mobile}.jpg and updates `media` in projects.json.
 * Uses Playwright's Chromium (installed with `npx playwright install chromium`).
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = path.join(root, "src", "content", "projects.json");
const FULL_MAX_HEIGHT = 5400;

/** Declines cookie banners (the privacy-preserving choice) so they don't cover the screenshot. */
async function declineCookies(page) {
  for (const name of [/^reject all$/i, /^reject$/i, /^decline$/i, /only (necessary|essential)/i, /^got it$/i]) {
    const btn = page.getByRole("button", { name }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(600);
      return;
    }
  }
}

async function settle(page) {
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    /* some sites never go idle — continue */
  }
  await declineCookies(page);
  // Nudge lazy content and scroll-triggered reveals, then return to top.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

async function capture(browser, project) {
  const outDir = path.join(root, "public", "projects", project.slug);
  await mkdir(outDir, { recursive: true });

  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await desktop.newPage();
  await page.goto(project.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await settle(page);
  await page.screenshot({ path: path.join(outDir, "desktop.jpg"), type: "jpeg", quality: 86 });
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.screenshot({
    path: path.join(outDir, "full.jpg"),
    type: "jpeg",
    quality: 82,
    fullPage: true,
    clip: { x: 0, y: 0, width: 1440, height: Math.min(fullHeight, FULL_MAX_HEIGHT) },
  });
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const mpage = await mobile.newPage();
  await mpage.goto(project.url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await settle(mpage);
  await mpage.screenshot({ path: path.join(outDir, "mobile.jpg"), type: "jpeg", quality: 84 });
  await mobile.close();

  return {
    desktop: `/projects/${project.slug}/desktop.jpg`,
    full: `/projects/${project.slug}/full.jpg`,
    mobile: `/projects/${project.slug}/mobile.jpg`,
    width: 1440,
    height: 900,
    fullHeight: Math.min(fullHeight, FULL_MAX_HEIGHT),
  };
}

const only = process.argv.slice(2);
const projects = JSON.parse(await readFile(dataFile, "utf8"));
const targets = projects.filter((p) => only.length === 0 || only.includes(p.slug));

if (targets.length === 0) {
  console.error(`No matching projects for: ${only.join(", ")}`);
  process.exit(1);
}

const browser = await chromium.launch();
let failed = 0;
for (const project of targets) {
  process.stdout.write(`↳ ${project.slug} (${project.url}) … `);
  try {
    project.media = await capture(browser, project);
    console.log("ok");
  } catch (err) {
    failed++;
    console.log(`failed: ${err.message.split("\n")[0]}`);
  }
}
await browser.close();
await writeFile(dataFile, JSON.stringify(projects, null, 2) + "\n");
process.exit(failed ? 2 : 0);
