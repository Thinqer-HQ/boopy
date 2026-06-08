/**
 * Boopy UI screenshot runner.
 * Usage: node scripts/screenshot-ui.mjs <email> <password>
 */
import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/screenshot-ui.mjs <email> <password>");
  process.exit(1);
}

const OUT = path.resolve("scripts/screenshots");
fs.mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:3000";
const ERRORS = [];

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  ✓ ${name}.png`);
  return file;
}

async function collectConsoleErrors(page) {
  const errs = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errs.push(msg.text());
  });
  page.on("pageerror", (err) => errs.push(err.message));
  return errs;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(`[${msg.text()}]`); });
  page.on("pageerror", (err) => consoleErrors.push(`[PAGEERROR] ${err.message}`));

  console.log("→ Login page");
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await shot(page, "00-login");

  // Login
  console.log("→ Authenticating…");
  try {
    // Try email input
    await page.fill('input[type="email"], input[name="email"]', email);
    await page.fill('input[type="password"], input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
  } catch (e) {
    console.warn("  Login flow issue:", e.message);
  }

  const currentUrl = page.url();
  console.log("  → After login:", currentUrl);

  // If still on login, abort authenticated pages
  const authenticated = !currentUrl.includes("/login");

  if (authenticated) {
    const ROUTES = [
      ["01-dashboard", "/"],
      ["02-groups", "/groups"],
      ["03-subscriptions", "/subscriptions"],
      ["04-calendar", "/calendar"],
      ["05-documents", "/documents"],
      ["06-reports", "/reports"],
      ["07-notifications", "/notifications"],
      ["08-settings-billing", "/settings/billing"],
      ["09-settings-notifications", "/settings/notifications"],
      ["10-settings-workspace", "/settings/workspace"],
    ];

    for (const [name, route] of ROUTES) {
      console.log(`→ ${route}`);
      await page.goto(BASE + route, { waitUntil: "networkidle" });
      await page.waitForTimeout(1500); // let client data load
      await shot(page, name);
    }

    // Test chat FAB
    console.log("→ Opening chat FAB…");
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    try {
      const fab = page.locator('button[aria-label="Open Boopy Assistant"]');
      await fab.click();
      await page.waitForTimeout(800);
      await shot(page, "11-chat-open");

      // Type in chat
      const input = page.locator('textarea[placeholder="Message Boopy…"]');
      if (await input.isVisible()) {
        await input.fill("What renews this week?");
        await shot(page, "12-chat-typed");
      }
    } catch (e) {
      console.warn("  Chat FAB test issue:", e.message);
    }

    // Check for visible JS errors on dashboard
    console.log("→ Checking for runtime errors on dashboard…");
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await shot(page, "13-dashboard-final");

  } else {
    console.warn("  Auth failed — only login page screenshot captured.");
    await shot(page, "00-login-failed");
  }

  if (consoleErrors.length) {
    console.log("\n⚠ Console / page errors collected:");
    consoleErrors.forEach((e) => console.log(" ", e));
    fs.writeFileSync(path.join(OUT, "errors.txt"), consoleErrors.join("\n"));
  } else {
    console.log("\n✓ No console errors detected.");
  }

  await browser.close();
  console.log(`\nScreenshots saved to: ${OUT}`);
})();
