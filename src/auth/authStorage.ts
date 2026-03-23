import type { AuthSession } from "../types/User";

const STORAGE_KEY = "leadchain_auth";

export const authStorage = {
  get(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  set(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  getToken(): string | null {
    const session = this.get();
    return session?.token ?? null;
  }
};
