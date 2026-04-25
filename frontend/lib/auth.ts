/**
 * Batman AI - Auth Utilities
 * Token storage and helpers for client-side auth.
 */

const TOKEN_KEY = "batman_ai_token";
const USER_KEY = "batman_ai_user";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AuthData {
  access_token: string;
  token_type: string;
  user: User;
}

export function saveAuth(data: AuthData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
