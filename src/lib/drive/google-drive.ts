import { getEnv } from "@/lib/env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

function getDriveRedirectUri(): string {
  const explicit = process.env.GOOGLE_DRIVE_REDIRECT_URI?.trim();
  if (explicit) return explicit;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  return `${appUrl}/api/integrations/google-drive/callback`;
}

export function getGoogleDriveAuthUrl(state: string): string {
  const env = getEnv();
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", getDriveRedirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", DRIVE_SCOPE);
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleDriveCode(code: string): Promise<TokenResponse> {
  const env = getEnv();
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    client_secret: env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: getDriveRedirectUri(),
    grant_type: "authorization_code",
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`Drive token exchange failed (${response.status})`);
  return (await response.json()) as TokenResponse;
}

export async function refreshDriveToken(refreshToken: string): Promise<TokenResponse> {
  const env = getEnv();
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    client_secret: env.GOOGLE_CLIENT_SECRET ?? "",
    grant_type: "refresh_token",
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error(`Drive token refresh failed (${response.status})`);
  return (await response.json()) as TokenResponse;
}

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
};

type DriveListResponse = {
  files: DriveFile[];
  nextPageToken?: string;
};

export async function listDriveFiles(params: {
  accessToken: string;
  folderId: string;
  modifiedAfter?: string;
  pageSize?: number;
}): Promise<DriveFile[]> {
  const conditions = [
    `'${params.folderId}' in parents`,
    `mimeType != 'application/vnd.google-apps.folder'`,
    `trashed = false`,
  ];
  if (params.modifiedAfter) {
    conditions.push(`modifiedTime > '${params.modifiedAfter}'`);
  }
  const q = conditions.join(" and ");
  const url = new URL(`${DRIVE_API}/files`);
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id,name,mimeType,modifiedTime,size),nextPageToken");
  url.searchParams.set("pageSize", String(params.pageSize ?? 50));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });
  if (!response.ok) throw new Error(`Drive files.list failed (${response.status})`);
  const data = (await response.json()) as DriveListResponse;
  return data.files ?? [];
}

export async function listDriveSubfolders(params: {
  accessToken: string;
  parentFolderId: string;
}): Promise<DriveFile[]> {
  const q = `'${params.parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = new URL(`${DRIVE_API}/files`);
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id,name,mimeType,modifiedTime)");
  url.searchParams.set("pageSize", "100");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });
  if (!response.ok) throw new Error(`Drive subfolder list failed (${response.status})`);
  const data = (await response.json()) as DriveListResponse;
  return data.files ?? [];
}

export async function findDriveFolder(params: {
  accessToken: string;
  name: string;
  parentFolderId?: string;
}): Promise<DriveFile | null> {
  const escapedName = params.name.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  const conditions = [
    `name = '${escapedName}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`,
  ];
  if (params.parentFolderId) {
    conditions.push(`'${params.parentFolderId}' in parents`);
  }
  const url = new URL(`${DRIVE_API}/files`);
  url.searchParams.set("q", conditions.join(" and "));
  url.searchParams.set("fields", "files(id,name,mimeType,modifiedTime)");
  url.searchParams.set("pageSize", "1");

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });
  if (!response.ok) throw new Error(`Drive folder search failed (${response.status})`);
  const data = (await response.json()) as DriveListResponse;
  return data.files?.[0] ?? null;
}

export async function downloadDriveFile(params: {
  accessToken: string;
  fileId: string;
}): Promise<Blob> {
  const url = `${DRIVE_API}/files/${encodeURIComponent(params.fileId)}?alt=media`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });
  if (!response.ok) throw new Error(`Drive file download failed (${response.status})`);
  return response.blob();
}
