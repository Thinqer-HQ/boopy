import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { getUserOrThrow } from "@/lib/auth";
import { buildReportRows, buildReportsCsv, filterReportRows } from "@/lib/reports/export";
import type { ReportSubscription } from "@/lib/reports/transformers";
import { supabaseService } from "@/lib/supabase/server";

type ExportFormat = "csv" | "pdf" | "xlsx" | "gsheet";
export const runtime = "nodejs";

type CalendarIntegrationRow = {
  workspace_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function inferFileBaseName(groupId: string | null, keyword: string | null) {
  if (groupId) return `boopy-report-group-${groupId}`;
  if (keyword) return `boopy-report-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return "boopy-report";
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error(`Google token refresh failed (${response.status})`);
  }
  return (await response.json()) as { access_token: string; expires_in?: number };
}

async function ensureGoogleAccessToken(
  integration: CalendarIntegrationRow,
  workspaceId: string
): Promise<string> {
  const expiry = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : 0;
  const needsRefresh = !integration.access_token || (expiry > 0 && expiry < Date.now() + 60_000);
  if (!needsRefresh) return integration.access_token ?? "";
  if (!integration.refresh_token) {
    throw new Error("Google integration refresh token missing. Reconnect your Google account.");
  }

  const refreshed = await refreshGoogleAccessToken(integration.refresh_token);
  const supabase = supabaseService();
  await supabase
    .from("calendar_integrations")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: refreshed.expires_in
        ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
        : null,
    })
    .eq("workspace_id", workspaceId)
    .eq("provider", "google");
  return refreshed.access_token;
}

async function createGoogleSheet(accessToken: string, title: string, rows: string[][]) {
  const createResponse = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: { title } }),
  });
  if (!createResponse.ok) {
    throw new Error(`Google Sheets create failed (${createResponse.status})`);
  }
  const created = (await createResponse.json()) as {
    spreadsheetId: string;
    spreadsheetUrl: string;
  };

  const updateResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/A1?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    }
  );
  if (!updateResponse.ok) {
    throw new Error(`Google Sheets update failed (${updateResponse.status})`);
  }
  return created.spreadsheetUrl;
}

async function buildPdfBuffer(title: string, rows: ReturnType<typeof buildReportRows>) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([900, 1100]);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 1040, width: 900, height: 60, color: rgb(0.14, 0.18, 0.34) });
  page.drawText(title, { x: 30, y: 1063, size: 18, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText(`Generated: ${new Date().toISOString()}`, {
    x: 30,
    y: 1048,
    size: 9,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  const headers = [
    "Group",
    "Vendor",
    "Category",
    "Status",
    "Cadence",
    "Currency",
    "Amount",
    "Monthly",
  ];
  const columns = [30, 180, 330, 470, 530, 600, 670, 760];
  let y = 1008;
  for (let i = 0; i < headers.length; i += 1) {
    page.drawText(headers[i] ?? "", { x: columns[i] ?? 30, y, size: 9, font: fontBold });
  }
  y -= 16;

  for (const row of rows.slice(0, 45)) {
    const values = [
      row.groupName,
      row.vendorName,
      row.category,
      row.status,
      row.cadence,
      row.currency,
      row.amount.toFixed(2),
      row.monthlyAmount.toFixed(2),
    ];
    for (let i = 0; i < values.length; i += 1) {
      page.drawText(values[i] ?? "", {
        x: columns[i] ?? 30,
        y,
        size: 8,
        font: fontRegular,
        maxWidth: i < 3 ? 140 : 80,
      });
    }
    y -= 14;
    if (y < 40) break;
  }

  return Buffer.from(await doc.save());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId")?.trim();
  const format = (url.searchParams.get("format")?.trim() ?? "csv") as ExportFormat;
  const groupId = url.searchParams.get("groupId")?.trim() ?? null;
  const keyword = url.searchParams.get("q")?.trim() ?? null;
  const currency = url.searchParams.get("currency")?.trim() ?? null;

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token || !workspaceId) return unauthorized();

  const user = await getUserOrThrow(token).catch(() => null);
  if (!user) return unauthorized();

  const supabase = supabaseService();
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, owner_user_id, name")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!workspace || workspace.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, vendor_name, category, amount, currency, cadence, status, groups!inner(id, name, workspace_id)"
    )
    .eq("groups.workspace_id", workspaceId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = filterReportRows(buildReportRows((data ?? []) as ReportSubscription[]), {
    groupId,
    keyword,
    currency,
  });

  const fileBase = `${inferFileBaseName(groupId, keyword)}${currency ? `-${currency.toLowerCase()}` : ""}`;
  if (format === "csv") {
    return new Response(buildReportsCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        "Subscription ID": row.subscriptionId,
        "Group ID": row.groupId,
        Group: row.groupName,
        Vendor: row.vendorName,
        Category: row.category,
        Status: row.status,
        Cadence: row.cadence,
        Currency: row.currency,
        Amount: row.amount,
        "Monthly Amount": row.monthlyAmount,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
      },
    });
  }

  if (format === "pdf") {
    const buffer = await buildPdfBuffer(`${workspace.name} - Subscription Report`, rows);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
      },
    });
  }

  if (format === "gsheet") {
    const { data: integration } = await supabase
      .from("calendar_integrations")
      .select("workspace_id, access_token, refresh_token, token_expires_at")
      .eq("workspace_id", workspaceId)
      .eq("provider", "google")
      .maybeSingle();
    if (!integration) {
      return NextResponse.json(
        { error: "Google account not connected. Connect Google Calendar first." },
        { status: 400 }
      );
    }

    const accessToken = await ensureGoogleAccessToken(
      integration as CalendarIntegrationRow,
      workspaceId
    );
    const sheetRows = [
      [
        "Subscription ID",
        "Group ID",
        "Group",
        "Vendor",
        "Category",
        "Status",
        "Cadence",
        "Currency",
        "Amount",
        "Monthly Amount",
      ],
      ...rows.map((row) => [
        row.subscriptionId,
        row.groupId,
        row.groupName,
        row.vendorName,
        row.category,
        row.status,
        row.cadence,
        row.currency,
        row.amount.toFixed(2),
        row.monthlyAmount.toFixed(2),
      ]),
    ];
    const spreadsheetUrl = await createGoogleSheet(
      accessToken,
      `${workspace.name} Boopy Report ${new Date().toISOString().slice(0, 10)}`,
      sheetRows
    );
    return NextResponse.json({ ok: true, url: spreadsheetUrl });
  }

  return NextResponse.json({ error: "Unsupported format." }, { status: 400 });
}
