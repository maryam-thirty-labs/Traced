import { get, post } from "@/shared/lib/api/http";

const TOKEN_KEY = "traced_token";
const USER_KEY = "traced_user";
const ME_CACHE_KEY = "traced_me";

type AuthResponse = {
  token: string;
  userId: string;
  displayName: string;
};

type StoredUser = {
  userId: string;
  displayName: string;
};

export type UserBackground =
  | "curious_adult"
  | "med_student"
  | "fitness"
  | "health_scare";

export type MeDto = {
  userId: string;
  displayName: string;
  email: string;
  learning_activated: boolean;
  account_mode: string;
  background: UserBackground;
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
  localStorage.removeItem(ME_CACHE_KEY);
}

export async function fetchMe(): Promise<MeDto> {
  const me = await get<MeDto>("/api/auth/me");
  try {
    localStorage.setItem(ME_CACHE_KEY, JSON.stringify(me));
  } catch {
    // localStorage may be unavailable (private mode, quota)
  }
  return me;
}

export function getCachedMe(): MeDto | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ME_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MeDto;
  } catch {
    return null;
  }
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
