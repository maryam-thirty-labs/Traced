import { post } from "@/shared/lib/api/http";

const TOKEN_KEY = "traced_token";
const USER_KEY = "traced_user";

type AuthResponse = {
  token: string;
  userId: string;
  displayName: string;
};

type StoredUser = {
  userId: string;
  displayName: string;
};

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await post<AuthResponse>("/api/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId: res.userId, displayName: res.displayName }));
  return res;
}

export async function register(email: string, password: string, displayName: string): Promise<AuthResponse> {
  const res = await post<AuthResponse>("/api/auth/register", { email, password, displayName });
  localStorage.setItem(TOKEN_KEY, res.token);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId: res.userId, displayName: res.displayName }));
  return res;
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
