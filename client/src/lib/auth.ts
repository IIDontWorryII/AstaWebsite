// client/src/lib/auth.ts
//
// Auth API calls. All four endpoints rely on the httpOnly auth cookie that
// the server sets on signup/login — `apiFetch` always includes credentials,
// so the cookie travels automatically. The frontend never reads or stores
// the token itself.

import type { AuthResponse, PublicUser } from "../../../shared/types";
import { apiFetch, jsonOrThrow } from "./api";

export interface SignupInput {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signup(input: SignupInput): Promise<PublicUser> {
  const res = await apiFetch("/api/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const { user } = await jsonOrThrow<AuthResponse>(res, "Signup failed");
  return user;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const res = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const { user } = await jsonOrThrow<AuthResponse>(res, "Login failed");
  return user;
}

export async function logout(): Promise<void> {
  const res = await apiFetch("/api/logout", { method: "POST" });
  if (!res.ok) throw new Error(`Logout failed: ${res.status}`);
}

/**
 * Returns the current user, or null if not logged in (server returns 401).
 * Used by AuthProvider on app load to restore session from cookie.
 */
export async function getMe(): Promise<PublicUser | null> {
  const res = await apiFetch("/api/me");
  if (res.status === 401) return null;
  const { user } = await jsonOrThrow<AuthResponse>(res, "Failed to fetch current user");
  return user;
}
