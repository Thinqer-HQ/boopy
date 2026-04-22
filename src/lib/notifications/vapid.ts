function toBase64(value: string) {
  return value.replaceAll("-", "+").replaceAll("_", "/");
}

export function base64UrlToUint8Array(base64String: string) {
  const normalized = toBase64(base64String.trim());
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const rawData = atob(normalized + padding);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}

export function isValidVapidPublicKey(value: string | null | undefined) {
  if (!value || value.trim().length === 0) return false;
  const sanitized = value.trim();
  if (!/^[A-Za-z0-9_-]+$/.test(sanitized)) return false;

  try {
    const bytes = base64UrlToUint8Array(sanitized);
    // VAPID public key is a raw uncompressed P-256 key (65 bytes)
    return bytes.length === 65;
  } catch {
    return false;
  }
}
