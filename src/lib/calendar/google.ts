import { getEnv } from "@/lib/env";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/spreadsheets",
];

export function getGoogleAuthUrl(state: string) {
  const env = getEnv();
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", env.GOOGLE_REDIRECT_URI ?? "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("scope", GOOGLE_SCOPES.join(" "));
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeGoogleCode(code: string) {
  const env = getEnv();
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID ?? "",
    client_secret: env.GOOGLE_CLIENT_SECRET ?? "",
    redirect_uri: env.GOOGLE_REDIRECT_URI ?? "",
    grant_type: "authorization_code",
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error(`Google token exchange failed (${response.status})`);
  }
  return (await response.json()) as TokenResponse;
}

export async function refreshGoogleAccessToken(refreshToken: string) {
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
  if (!response.ok) {
    throw new Error(`Google token refresh failed (${response.status})`);
  }
  return (await response.json()) as TokenResponse;
}

export async function upsertGoogleEvent(params: {
  accessToken: string;
  calendarId: string;
  eventId?: string;
  title: string;
  description: string;
  date: string;
}) {
  const payload = {
    summary: params.title,
    description: params.description,
    start: { date: params.date },
    end: { date: params.date },
  };

  const url = params.eventId
    ? `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events/${params.eventId}`
    : `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(params.calendarId)}/events`;
  const response = await fetch(url, {
    method: params.eventId ? "PATCH" : "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Google calendar upsert failed (${response.status})`);
  }
  return (await response.json()) as { id: string };
}
