import { cookies } from "next/headers";
import { cookieName, createSessionToken, verifySessionToken, type SessionUser } from "@/lib/session-core";

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(cookieName)?.value);
}

export async function setSession(user: SessionUser) {
  const store = await cookies();
  store.set(cookieName, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(cookieName);
}

export { cookieName, createSessionToken, verifySessionToken, type SessionUser };
