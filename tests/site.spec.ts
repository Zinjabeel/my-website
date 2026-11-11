import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  { path: "/", h1: /Websites that/ },
  { path: "/work", h1: /Our work/ },
  { path: "/work/astro-example", h1: /Astro/ },
  { path: "/about", h1: /A small team/ },
  { path: "/process", h1: /From first call/ },
  { path: "/contact", h1: /Let's talk/ },
];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Download the React DevTools|\[HMR\]|favicon/.test(m.text())) errors.push(m.text());
  });
  return errors;
}

for (const p of PAGES) {
  test(`renders ${p.path} without errors`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(p.h1);
    await expect(page).toHaveTitle(/Launchly/);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain(p.path === "/" ? "" : p.path);
    // Every image has an alt attribute
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);
    // Exactly one h1
    await expect(page.locator("h1")).toHaveCount(1);
    await page.waitForTimeout(1200);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test("unknown route shows the 404 page", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Lost in");
});

test("studio is reachable in dev and hidden from robots", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /studio");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/work</loc>");
  expect(sitemap).not.toContain("astro-example"); // placeholder projects are excluded
});

test("security headers are present", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-powered-by"]).toBeUndefined();
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop dock only");
  test("dock links reach every page and mark the active one", async ({ page }) => {
    await page.goto("/");
    const dock = page.getByRole("navigation", { name: "Primary" });
    for (const [label, path] of [
      ["Work", "/work"],
      ["About", "/about"],
      ["Process", "/process"],
      ["Contact", "/contact"],
    ]) {
      await dock.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(dock.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
    await dock.getByRole("link", { name: "Launchly — home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("project card opens the case study, preview modes switch", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: /Astro — view case study/ }).click();
    await expect(page).toHaveURL("/work/astro-example");
    await expect(page.getByText("This is an example entry")).toBeVisible();
    await page.getByRole("button", { name: "Live site" }).click();
    await expect(page.locator('iframe[title="Live preview of Astro"]')).toHaveAttribute("sandbox", /allow-scripts/);
    await page.getByRole("button", { name: "Mobile view" }).click();
    await page.getByRole("button", { name: "Screenshot" }).click();
    await expect(page.getByRole("img", { name: /Full-page screenshot.*mobile/ })).toBeVisible();
    const visit = page.getByRole("link", { name: /Visit the website/ });
    await expect(visit).toHaveAttribute("target", "_blank");
    await expect(visit).toHaveAttribute("rel", /noopener/);
  });

  test("services accordion is keyboard operable", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /SEO foundations/ });
    await btn.focus();
    await page.keyboard.press("Enter");
    await expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");
  test("menu sheet opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle"); // wait for hydration before interacting
    await page.getByRole("button", { name: "Menu" }).click();
    const sheet = page.getByRole("dialog", { name: "Site menu" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("link", { name: /Process/ }).click();
    await expect(page).toHaveURL("/process");
    await expect(sheet).toBeHidden();
  });

  test("no horizontal overflow on any page", async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p.path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${p.path} overflows by ${overflow}px`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("contact form", () => {
  test("shows field errors, then submits successfully", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Please enter your name.")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();

    await page.getByLabel("Name").fill("Playwright Test");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Message").fill("short");
    await page.getByLabel("Message").blur();
    await expect(page.getByText("Tell us a little more")).toBeVisible();

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByText("New website", { exact: true }).click();
    await page.getByLabel(/Budget/).selectOption("Not sure yet");
    await page.getByLabel("Message").fill("Automated test enquiry — please ignore. We need a new website.");
    await page.waitForTimeout(2600); // the API rejects forms submitted faster than a human could
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByRole("status")).toContainText("Message received.");
  });

  test("API rejects cross-origin and invalid payloads", async ({ request }) => {
    const cross = await request.post("/api/contact", {
      headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
      data: {},
    });
    expect(cross.status()).toBe(403);

    const invalid = await request.post("/api/contact", {
      headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" },
      data: { name: "x", email: "bad", message: "", projectType: "nope", startedAt: 1 },
    });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).fields.email).toBeTruthy();

    const bot = await request.post("/api/contact", {
      headers: { Origin: "http://localhost:3000", "Content-Type": "application/json" },
      data: { name: "Bot", email: "b@b.co", projectType: "New website", message: "x".repeat(30), website: "spam", startedAt: 1 },
    });
    expect((await bot.json()).ok).toBe(true); // silently accepted, never delivered
  });
});

test("reduced motion shows the still hero instead of 3D", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByText("The Launch Archive", { exact: true })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await ctx.close();
});
