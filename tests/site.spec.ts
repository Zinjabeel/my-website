import { expect, test, type Page } from "@playwright/test";

const PAGES = [
  { path: "/", h1: /Websites that/ },
  { path: "/work", h1: /Websites we've launched/ },
  { path: "/work/ogcw", h1: /One Great Culture World/ },
  { path: "/services", h1: /One team/ },
  { path: "/services/build", h1: /Website design/ },
  { path: "/process", h1: /From first call/ },
  { path: "/about", h1: /A small team/ },
  { path: "/contact", h1: /Ask us anything/ },
  { path: "/start", h1: /Tell us about your website/ },
  { path: "/legal/privacy", h1: /Privacy Policy/ },
];

/** Most tests start with the storage notice already dismissed so it can't cover anything. */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    try {
      localStorage.setItem("launchly-storage-notice", "1");
    } catch {}
  });
});

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
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toContainText(p.h1);
    await expect(page).toHaveTitle(/Launchly/);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain(p.path === "/" ? "" : p.path);
    expect(await page.locator("img:not([alt])").count()).toBe(0);
    // The site frame is on every page.
    await expect(page.getByRole("banner").getByRole("link", { name: "Launchly — home" })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacy Policy" })).toBeAttached();
    await page.keyboard.press("Escape"); // /start opens the account dialog
    await page.waitForTimeout(1000);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}

test("unknown route shows the 404 page", async ({ page }) => {
  const res = await page.goto("/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.locator("h1")).toContainText("Lost in the archive");
});

test("robots and sitemap describe the site correctly", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const p of ["/studio", "/account", "/auth/", "/api/"]) expect(robots).toContain(`Disallow: ${p}`);
  expect(robots).toContain("Sitemap:");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const p of ["/work</loc>", "/services</loc>", "/services/seo</loc>", "/work/ogcw</loc>", "/start</loc>", "/legal/cookies</loc>"]) {
    expect(sitemap).toContain(p);
  }
  expect(sitemap).not.toContain("/account");
});

test("security headers are present", async ({ request }) => {
  const h = (await request.get("/")).headers();
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("structured data is valid JSON on the homepage", async ({ page }) => {
  await page.goto("/");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  expect(types).toEqual(expect.arrayContaining(["ProfessionalService", "WebSite", "FAQPage"]));
});

test("storage notice appears once and stays dismissed", async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/about");
  const notice = page.getByRole("complementary", { name: "Cookies and storage" });
  await expect(notice).toBeVisible();
  await notice.getByRole("button", { name: "Got it" }).click();
  await expect(notice).toBeHidden();
  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(notice).toBeHidden();
  await ctx.close();
});

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "desktop header only");

  test("header links reach every page and mark the active one", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, path] of [
      ["Work", "/work"],
      ["Services", "/services"],
      ["Process", "/process"],
      ["About", "/about"],
      ["Contact", "/contact"],
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(path);
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
    }
    await page.getByRole("banner").getByRole("link", { name: "Launchly — home" }).click();
    await expect(page).toHaveURL("/");
  });

  test("every Start a project button leads to the start page", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.getByRole("link", { name: /^Start a project/ }).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(2);
    expect(new Set(hrefs)).toEqual(new Set(["/start"]));
    await page.getByRole("banner").getByRole("link", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/start");
  });

  test("project opens its case study; blocked sites fall back to screenshots", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("link", { name: /One Great Culture World — view case study/ }).click();
    await expect(page).toHaveURL("/work/ogcw");
    // OGCW forbids framing, so the live view is switched off rather than broken.
    await expect(page.getByRole("button", { name: "Live site" })).toBeDisabled();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("button", { name: "Mobile view" }).click();
    await expect(page.getByRole("img", { name: /Full-page screenshot.*mobile/ })).toBeVisible();
    const visit = page.getByRole("link", { name: /Visit the website/ });
    await expect(visit).toHaveAttribute("target", "_blank");
    await expect(visit).toHaveAttribute("rel", /noopener/);
  });

  test("FAQ opens with the keyboard", async ({ page }) => {
    await page.goto("/");
    const q = page.locator("summary", { hasText: "What happens after launch?" });
    await q.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("We stay on. For the first 12 months")).toBeVisible();
  });
});

test.describe("mobile navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile only");

  test("menu sheet opens, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle"); // wait for hydration before interacting
    await page.getByRole("button", { name: "Open menu" }).click();
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

test.describe("accounts", () => {
  test("start page opens the account dialog; it can be explored and closed", async ({ page }) => {
    await page.goto("/start");
    const dialog = page.getByRole("dialog", { name: "Create your account" });
    await expect(dialog).toBeVisible();

    // Password rules react as you type.
    await dialog.getByLabel("Name").fill("Test Person");
    await dialog.getByLabel("Email").fill("test.person@example.com");
    await dialog.getByLabel("Password", { exact: true }).fill("short1");
    await expect(dialog.getByText("At least 12 characters — not met yet")).toBeAttached();
    await dialog.getByLabel("Password", { exact: true }).fill("orbit-Lantern-2291");
    await expect(dialog.getByText("Password strength: Strong")).toBeVisible();
    await dialog.getByRole("button", { name: "Show password" }).click();
    await expect(dialog.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");

    // Tabs and the reset view.
    await dialog.getByRole("tab", { name: "Log in" }).click();
    await expect(page.getByRole("dialog", { name: "Log in" })).toBeVisible();
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.getByRole("dialog", { name: "Forgot your password?" })).toBeVisible();

    // Escape closes; the page behind explains what to do next.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Log in or create an account to continue." })).toBeVisible();
    await page.getByRole("main").getByRole("button", { name: "Log in", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Log in" })).toBeVisible();
  });

  test("header account button opens the login dialog; account page is protected", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("banner").getByRole("button", { name: "Log in or create an account" }).click();
    await expect(page.getByRole("dialog", { name: "Log in" })).toBeVisible();
    await page.keyboard.press("Escape");

    await page.goto("/account");
    await expect(page.getByRole("dialog", { name: "Log in" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("heading", { name: "Log in to see your account." })).toBeVisible();
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
  });

  test("signup validates before anything is sent", async ({ page }) => {
    await page.goto("/start");
    const dialog = page.getByRole("dialog", { name: "Create your account" });
    await expect(dialog).toBeVisible();
    const submit = dialog.getByRole("button", { name: "Create account", exact: true });
    if (await submit.isDisabled()) {
      // Account service not connected in this environment: the dialog says so instead of failing silently.
      await expect(dialog.getByText("Accounts aren't switched on yet.")).toBeVisible();
      return;
    }
    await submit.click();
    await expect(dialog.getByText("Enter your name.")).toBeVisible();
    await expect(dialog.getByText("Please accept the terms to create an account.")).toBeVisible();
  });
});

test.describe("contact form", () => {
  test("shows field errors, then submits successfully", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Send message" }).click();
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
    await page.getByLabel("Message").fill("Automated test message — please ignore. We need a new website.");
    await page.waitForTimeout(2600); // the API rejects forms submitted faster than a human could
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status")).toContainText("Message received.");
  });

  test("API rejects cross-origin and invalid payloads", async ({ request, baseURL }) => {
    const cross = await request.post("/api/contact", { headers: { Origin: "https://evil.example", "Content-Type": "application/json" }, data: {} });
    expect(cross.status()).toBe(403);

    const invalid = await request.post("/api/contact", {
      headers: { Origin: baseURL!, "Content-Type": "application/json" },
      data: { name: "x", email: "bad", message: "", projectType: "nope", startedAt: 1 },
    });
    expect(invalid.status()).toBe(422);
    expect((await invalid.json()).fields.email).toBeTruthy();

    const bot = await request.post("/api/contact", {
      headers: { Origin: baseURL!, "Content-Type": "application/json" },
      data: { name: "Bot", email: "b@b.co", projectType: "New website", message: "x".repeat(30), website: "spam", startedAt: 1 },
    });
    expect((await bot.json()).ok).toBe(true); // silently accepted, never delivered
  });
});

test("reduced motion shows the still archive instead of 3D", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.getByText("Pick a case below")).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await ctx.close();
});
