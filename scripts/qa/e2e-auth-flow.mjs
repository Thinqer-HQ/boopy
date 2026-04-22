import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

function getArg(name, fallback) {
  const token = process.argv.find((value) => value.startsWith(`${name}=`));
  if (!token) return fallback;
  return token.slice(name.length + 1);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isoDateDaysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const baseUrl = getArg("--base-url", "http://localhost:3000");
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  const runId = Date.now();
  const email = `playwright+${runId}@boopy.local`;
  const password = `Boopy!${runId}Aa`;
  const groupName = `PW Group ${runId}`;
  const vendorName = `PW Vendor ${runId}`;

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError) {
    throw new Error(`Failed to create test user: ${createUserError.message}`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.grantPermissions(["notifications"], { origin: baseUrl });
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  try {
    await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await Promise.all([
      page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30000 }),
      page.getByRole("button", { name: "Sign in" }).click(),
    ]);

    const setupDialogSave = page.getByRole("button", { name: /Save and continue/i });
    const setupVisible = await setupDialogSave.isVisible().catch(() => false);
    if (setupVisible) {
      await page.fill("#workspace-name", "Playwright Workspace");
      await page.fill("#workspace-currency", "USD");
      await setupDialogSave.click();
      await page.waitForTimeout(1200);
    }

    await page.goto(`${baseUrl}/groups`, { waitUntil: "networkidle" });
    const setupDialogSaveOnGroups = page.getByRole("button", { name: /Save and continue/i });
    const setupVisibleOnGroups = await setupDialogSaveOnGroups.isVisible().catch(() => false);
    if (setupVisibleOnGroups) {
      await page.fill("#workspace-name", "Playwright Workspace");
      await page.fill("#workspace-currency", "USD");
      await setupDialogSaveOnGroups.click();
      await page.waitForTimeout(1200);
    }
    await page.getByRole("button", { name: "Add group" }).click();
    await page.fill("#group-name", groupName);
    await page.getByRole("button", { name: "Save" }).click();

    const groupRow = page.getByRole("row", { name: new RegExp(groupName) });
    await groupRow.waitFor({ timeout: 15000 });
    const nonLinkCell = groupRow.locator("td").nth(1);
    await Promise.all([
      page.waitForURL(/\/groups\/[^/?#]+(?:[?#].*)?$/, { timeout: 15000 }),
      nonLinkCell.click(),
    ]);
    await page.getByRole("button", { name: "Add subscription" }).waitFor({ timeout: 10000 });

    await page.getByRole("button", { name: "Add subscription" }).click();
    await page.fill("#vendor", vendorName);
    await page.fill("#amount", "19.99");
    await page.fill("#currency", "USD");
    await page.fill("#renewal", isoDateDaysFromNow(14));
    await page.getByRole("button", { name: "Save" }).click();

    await page.getByRole("cell", { name: vendorName }).waitFor({ timeout: 15000 });
    const dbConstraintError = page.getByText(/null value in column "client_id"/i);
    if (await dbConstraintError.count()) {
      throw new Error("Regression detected: client_id NOT NULL error is still present.");
    }

    await page.goto(`${baseUrl}/settings/notifications`, { waitUntil: "networkidle" });
    const pushButton = page.getByRole("button", { name: "Enable push on this device" });
    await pushButton.waitFor({ timeout: 15000 });
    if (!(await pushButton.isDisabled())) {
      await pushButton.click();
      await page.waitForTimeout(2000);
      const invalidVapidError = page.getByText(/applicationServerKey is not valid|Push configuration is invalid/i);
      if (await invalidVapidError.count()) {
        throw new Error("Push VAPID configuration is still invalid.");
      }
    }

    for (const route of ["/reports", "/subscriptions", "/calendar", "/documents", "/settings/billing"]) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      if (page.url().includes("/login")) {
        throw new Error(`Expected authenticated access for ${route}, but got redirected to login.`);
      }
    }

    if (pageErrors.length > 0) {
      throw new Error(`Page runtime errors detected: ${pageErrors.join(" | ")}`);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          baseUrl,
          userId: createdUser.user?.id ?? null,
          email,
          tested: [
            "auth_login",
            "groups_add",
            "groups_row_navigation",
            "subscriptions_add",
            "push_enable",
            "reports_page",
            "subscriptions_page",
            "calendar_page",
            "documents_page",
            "notifications_settings_page",
            "billing_settings_page",
          ],
        },
        null,
        2
      )
    );
  } finally {
    await context.close();
    await browser.close();

    if (createdUser.user?.id) {
      await admin.auth.admin.deleteUser(createdUser.user.id);
    }
  }
}

await main();
