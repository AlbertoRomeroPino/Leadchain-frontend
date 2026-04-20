import type { AuthSession } from "../types/users/User";

const STORAGE_KEY = "leadchain_auth";
const TIMESTAMP_KEY = "leadchain_auth_timestamp";

// Configuración de expiración: 3 días en milisegundos
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 3 días

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
    // Guardar timestamp de cuando se guardó la sesión
    localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
  },

  getToken(): string | null {
    const session = this.get();
    return session?.token ?? null;
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
