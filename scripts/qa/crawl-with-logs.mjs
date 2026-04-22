import { chromium } from "playwright";

const baseUrl = process.env.CRAWL_BASE_URL ?? "http://localhost:3100";
const maxPages = Number.parseInt(process.env.CRAWL_MAX_PAGES ?? "20", 10);
const crawlEmail = process.env.CRAWL_EMAIL;
const crawlPassword = process.env.CRAWL_PASSWORD;
const seedPaths = [
  "/",
  "/login",
  "/groups",
  "/reports",
  "/documents",
  "/settings/notifications",
  "/settings/billing",
];

function normalizeUrl(url) {
  try {
    const parsed = new URL(url, baseUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (parsed.origin !== new URL(baseUrl).origin) return null;
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

async function crawl() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  if (crawlEmail && crawlPassword) {
    const loginPage = await context.newPage();
    await loginPage.goto(normalizeUrl("/login"), { waitUntil: "networkidle" });
    await loginPage.fill('input[type="email"]', crawlEmail);
    await loginPage.fill('input[type="password"]', crawlPassword);
    await Promise.all([
      loginPage.waitForNavigation({ waitUntil: "networkidle" }),
      loginPage.click('button[type="submit"]'),
    ]);
    await loginPage.close();
  }

  const queue = [...new Set(seedPaths.map((path) => normalizeUrl(path)).filter(Boolean))];
  const visited = new Set();
  const results = [];
  const errorLogs = [];

  while (queue.length > 0 && visited.size < maxPages) {
    const target = queue.shift();
    if (!target || visited.has(target)) continue;
    visited.add(target);

    const page = await context.newPage();
    const pageEntry = {
      url: target,
      finalUrl: null,
      status: null,
      consoleErrors: [],
      pageErrors: [],
      requestFailures: [],
    };

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = `[console.error] ${message.text()}`;
        pageEntry.consoleErrors.push(text);
        errorLogs.push({ url: target, kind: "console", message: text });
      }
    });

    page.on("pageerror", (error) => {
      const text = `[pageerror] ${error.message}`;
      pageEntry.pageErrors.push(text);
      errorLogs.push({ url: target, kind: "pageerror", message: text });
    });

    page.on("requestfailed", (request) => {
      const failure = request.failure()?.errorText ?? "request failed";
      const text = `[requestfailed] ${request.method()} ${request.url()} :: ${failure}`;
      pageEntry.requestFailures.push(text);
      errorLogs.push({ url: target, kind: "requestfailed", message: text });
    });

    try {
      const response = await page.goto(target, { waitUntil: "networkidle", timeout: 30000 });
      pageEntry.status = response?.status() ?? null;
      pageEntry.finalUrl = page.url();
      if (pageEntry.status !== null && pageEntry.status >= 500) {
        const text = `[server-error] status=${pageEntry.status}`;
        pageEntry.pageErrors.push(text);
        errorLogs.push({ url: target, kind: "status", message: text });
      }
      await page.waitForTimeout(400);

      const links = await page.$$eval("a[href]", (nodes) =>
        nodes
          .map((node) => node.getAttribute("href"))
          .filter(Boolean)
          .slice(0, 200)
      );
      for (const href of links) {
        const resolved = normalizeUrl(href);
        if (!resolved) continue;
        if (!visited.has(resolved) && !queue.includes(resolved) && visited.size + queue.length < maxPages * 3) {
          queue.push(resolved);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      pageEntry.pageErrors.push(`[navigation] ${message}`);
      errorLogs.push({ url: target, kind: "navigation", message });
    } finally {
      results.push(pageEntry);
      await page.close();
    }
  }

  await browser.close();

  const summary = {
    baseUrl,
    visitedPages: results.length,
    pagesWithErrors: results.filter(
      (r) => r.consoleErrors.length || r.pageErrors.length || r.requestFailures.length
    ).length,
    totalErrorEvents: errorLogs.length,
    results,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (errorLogs.length > 0) {
    process.exitCode = 1;
  }
}

await crawl();
