import type { AuthSession, User } from "../types";

const STORAGE_KEY = "leadchain_auth";
const TIMESTAMP_KEY = "leadchain_auth_timestamp";

// Configuración de expiración: 3 días en milisegundos
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 3 días

// Type guards
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "nombre" in value &&
    "apellidos" in value &&
    "email" in value
  );
}

// Extraer usuario desde diferentes formatos de payload (compatibilidad con storage viejo)
export function resolveUser(value: unknown): User | null {
  if (isUser(value)) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "user" in value &&
    isUser((value as { user: unknown }).user)
  ) {
    return (value as { user: User }).user;
  }

  return null;
}

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
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
  },

  getToken(): string | null {
    return this.get()?.token ?? null;
  },

  // Obtener usuario desde sesión guardada
  getUser(): User | null {
    const session = this.get();
    return session?.user ? resolveUser(session.user) : null;
  },

  // Verificar si la sesión ha expirado
  isSessionExpired(): boolean {
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestamp) return false;
    
    const sessionAge = Date.now() - parseInt(timestamp, 10);
    return sessionAge > SESSION_TIMEOUT;
  },

  // Obtener tiempo restante en ms
  getTimeRemaining(): number {
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!timestamp) return 0;
    
    const sessionAge = Date.now() - parseInt(timestamp, 10);
    return Math.max(0, SESSION_TIMEOUT - sessionAge);
  }
};
