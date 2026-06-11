import { extractSubscriptionFromFile } from "@/lib/ingestion/extract-subscription-from-file";
import { log } from "@/lib/log";
import { supabaseService } from "@/lib/supabase/server";

import {
  downloadDriveFile,
  findDriveFolder,
  listDriveFiles,
  listDriveSubfolders,
  refreshDriveToken,
  type DriveFile,
} from "./google-drive";

const AUTO_CREATE_CONFIDENCE_THRESHOLD = 0.68;

type DriveIntegration = {
  id: string;
  workspace_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  root_folder_name: string;
  root_folder_id: string | null;
  last_synced_at: string | null;
};

type GroupRow = {
  id: string;
  name: string;
};

async function getValidToken(
  integration: DriveIntegration
): Promise<{ accessToken: string; expiresAt: string | null } | null> {
  const supabase = supabaseService();
  const now = Date.now();
  const expiry = integration.token_expires_at
    ? new Date(integration.token_expires_at).getTime()
    : 0;
  const needsRefresh = expiry - now < 5 * 60 * 1000;

  if (!needsRefresh && integration.access_token) {
    return { accessToken: integration.access_token, expiresAt: integration.token_expires_at };
  }

  if (!integration.refresh_token) return null;

  try {
    const refreshed = await refreshDriveToken(integration.refresh_token);
    const newExpiry = refreshed.expires_in
      ? new Date(now + refreshed.expires_in * 1000).toISOString()
      : null;
    await supabase
      .from("drive_integrations")
      .update({
        access_token: refreshed.access_token,
        token_expires_at: newExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq("workspace_id", integration.workspace_id);
    return { accessToken: refreshed.access_token, expiresAt: newExpiry };
  } catch {
    return null;
  }
}

function matchGroupByName(folderName: string, groups: GroupRow[]): GroupRow | null {
  const normalized = folderName.trim().toLowerCase();
  return groups.find((g) => g.name.trim().toLowerCase() === normalized) ?? null;
}

async function processFile(params: {
  accessToken: string;
  file: DriveFile;
  workspaceId: string;
  folderName: string | null;
  suggestedGroupId: string | null;
  matchedGroupId: string | null;
}): Promise<"created" | "drafted" | "skipped" | "failed"> {
  const supabase = supabaseService();

  const { data: existing } = await supabase
    .from("drive_processed_files")
    .select("id")
    .eq("workspace_id", params.workspaceId)
    .eq("drive_file_id", params.file.id)
    .maybeSingle();
  if (existing) return "skipped";

  const PROCESSABLE_MIMES = [
    "application/pdf",
    "text/plain",
    "text/csv",
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const isProcessable =
    PROCESSABLE_MIMES.includes(params.file.mimeType) ||
    params.file.mimeType.startsWith("image/") ||
    params.file.mimeType.startsWith("text/");
  if (!isProcessable) {
    await supabase.from("drive_processed_files").insert({
      workspace_id: params.workspaceId,
      drive_file_id: params.file.id,
      file_name: params.file.name,
      status: "skipped",
    });
    return "skipped";
  }

  try {
    const blob = await downloadDriveFile({
      accessToken: params.accessToken,
      fileId: params.file.id,
    });

    const extraction = await extractSubscriptionFromFile({
      filename: params.file.name,
      mimeType: params.file.mimeType,
      blob,
    });

    const fields = extraction.fields;
    const isHighConfidence =
      extraction.confidence >= AUTO_CREATE_CONFIDENCE_THRESHOLD && Boolean(fields.vendorName);

    const today = new Date().toISOString().slice(0, 10);
    const renewalDate =
      fields.renewalDate ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (params.matchedGroupId && isHighConfidence) {
      await supabase.from("subscriptions").insert({
        group_id: params.matchedGroupId,
        vendor_name: fields.vendorName,
        amount: fields.amount ?? 0,
        currency: (fields.currency ?? "USD").toUpperCase(),
        cadence: fields.cadence ?? "monthly",
        renewal_date: renewalDate,
        start_date: fields.startDate ?? today,
        end_date: fields.endDate ?? null,
        status: "active",
        notes: `Auto-imported from Google Drive: ${params.file.name}`,
      });

      await supabase.from("drive_processed_files").insert({
        workspace_id: params.workspaceId,
        drive_file_id: params.file.id,
        file_name: params.file.name,
        status: "processed",
      });
      return "created";
    }

    await supabase.from("subscription_drafts").insert({
      workspace_id: params.workspaceId,
      source: "drive",
      drive_file_id: params.file.id,
      drive_file_name: params.file.name,
      folder_name: params.folderName,
      suggested_group_id: params.suggestedGroupId ?? params.matchedGroupId,
      extracted_fields: fields,
      status: "pending",
    });

    await supabase.from("drive_processed_files").insert({
      workspace_id: params.workspaceId,
      drive_file_id: params.file.id,
      file_name: params.file.name,
      status: "processed",
    });
    return "drafted";
  } catch (err) {
    log.warn("drive_file_process_failed", {
      workspaceId: params.workspaceId,
      fileId: params.file.id,
      error: err instanceof Error ? err.message : "unknown",
    });
    await supabase.from("drive_processed_files").insert({
      workspace_id: params.workspaceId,
      drive_file_id: params.file.id,
      file_name: params.file.name,
      status: "failed",
    });
    return "failed";
  }
}

export async function scanDriveForWorkspace(workspaceId: string): Promise<{
  created: number;
  drafted: number;
  skipped: number;
  failed: number;
}> {
  const supabase = supabaseService();
  const counts = { created: 0, drafted: 0, skipped: 0, failed: 0 };

  const { data: integration } = await supabase
    .from("drive_integrations")
    .select(
      "id, workspace_id, access_token, refresh_token, token_expires_at, root_folder_name, root_folder_id, last_synced_at"
    )
    .eq("workspace_id", workspaceId)
    .eq("enabled", true)
    .maybeSingle();

  if (!integration) return counts;

  const tokenResult = await getValidToken(integration as DriveIntegration);
  if (!tokenResult) {
    log.warn("drive_scan_no_token", { workspaceId });
    return counts;
  }
  const { accessToken } = tokenResult;

  let rootFolderId = (integration as DriveIntegration).root_folder_id;
  const rootFolderName = (integration as DriveIntegration).root_folder_name || "Boopy";

  if (!rootFolderId) {
    const found = await findDriveFolder({ accessToken, name: rootFolderName });
    if (!found) {
      log.info("drive_scan_no_root_folder", { workspaceId, rootFolderName });
      return counts;
    }
    rootFolderId = found.id;
    await supabase
      .from("drive_integrations")
      .update({ root_folder_id: found.id, updated_at: new Date().toISOString() })
      .eq("workspace_id", workspaceId);
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("id, name")
    .eq("workspace_id", workspaceId);
  const groupList = (groups ?? []) as GroupRow[];

  const modifiedAfter = (integration as DriveIntegration).last_synced_at ?? undefined;

  const subfolders = await listDriveSubfolders({ accessToken, parentFolderId: rootFolderId });
  const rootFiles = await listDriveFiles({ accessToken, folderId: rootFolderId, modifiedAfter });

  for (const file of rootFiles) {
    const result = await processFile({
      accessToken,
      file,
      workspaceId,
      folderName: rootFolderName,
      suggestedGroupId: null,
      matchedGroupId: null,
    });
    counts[result]++;
  }

  for (const folder of subfolders) {
    const matchedGroup = matchGroupByName(folder.name, groupList);
    const files = await listDriveFiles({
      accessToken,
      folderId: folder.id,
      modifiedAfter,
    });
    for (const file of files) {
      const result = await processFile({
        accessToken,
        file,
        workspaceId,
        folderName: folder.name,
        suggestedGroupId: matchedGroup?.id ?? null,
        matchedGroupId: matchedGroup?.id ?? null,
      });
      counts[result]++;
    }
  }

  await supabase
    .from("drive_integrations")
    .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("workspace_id", workspaceId);

  log.info("drive_scan_complete", { workspaceId, ...counts });
  return counts;
}
