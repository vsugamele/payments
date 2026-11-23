export const OWNER_SESSION_COOKIE = "vs_owner_session";
export const OWNER_UI_COOKIE = "vs_internal_pass";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 dias

const enc = new TextEncoder();

export function getExpectedAccessKey(): string {
  return (process.env.ADMIN_ACCESS_KEY || "vs2026").trim();
}

function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    `${getExpectedAccessKey()}::vs-payments-owner-hmac-v1`
  ).trim();
}

export function constantTimeEqual(a: string, b: string): boolean {
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

async function hmacSha256Hex(payload: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    enc.encode(getSigningSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createOwnerSessionToken(
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `v1.${exp}`;
  const sig = await hmacSha256Hex(payload);
  return `${payload}.${sig}`;
}

export async function verifyOwnerSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  const payload = `${parts[0]}.${parts[1]}`;
  const expectedSig = await hmacSha256Hex(payload);
  return constantTimeEqual(parts[2], expectedSig);
}

export function isValidAccessKey(candidate: string | undefined | null): boolean {
  if (!candidate || typeof candidate !== "string") return false;
  return constantTimeEqual(candidate.trim(), getExpectedAccessKey());
}
