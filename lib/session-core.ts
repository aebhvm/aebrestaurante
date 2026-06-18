import type { UserRole } from "@/db/schema";

export type SessionUser = {
  id: number;
  name: string;
  username: string;
  role: UserRole;
};

export const cookieName = "barops_session";

const encoder = new TextEncoder();

function base64Url(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function key() {
  const secret = process.env.AUTH_SECRET ?? "local-development-secret-change-me";
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(payload: string) {
  return base64Url(await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload)));
}

export async function createSessionToken(user: SessionUser) {
  const payload = base64Url(JSON.stringify({ ...user, exp: Date.now() + 1000 * 60 * 60 * 12 }));
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const valid = await crypto.subtle.verify("HMAC", await key(), fromBase64Url(signature), encoder.encode(payload));
  if (!valid) return null;

  const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as SessionUser & { exp: number };
  if (decoded.exp < Date.now()) return null;

  return { id: decoded.id, name: decoded.name, username: decoded.username, role: decoded.role };
}
