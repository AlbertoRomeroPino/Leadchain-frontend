import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from "axios";
import type { AuthSession, User } from "../types";
import { authStorage } from "../auth/authStorage";
import { authService } from "./authService";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "/";

// Tipo extendido para configuración de request con propiedades personalizadas
type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  __refreshRetried?: boolean;
};

const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
};

export const publicHttp = axios.create(axiosConfig);
export const authHttp = axios.create(axiosConfig);
export const http = authHttp;

// Callbacks para sincronización con el Context
let onUnauthorized: (() => void) | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;
let onUserUpdated: ((user: User) => void) | null = null;

// Control para evitar múltiples refresh simultáneos
let refreshPromise: Promise<string | null> | null = null;

export function setAuthCallbacks(callbacks: {
  onUnauthorized: () => void;
  onTokenRefreshed?: (token: string) => void;
  onUserUpdated?: (user: User) => void;
}) {
  onUnauthorized = callbacks.onUnauthorized;
  onTokenRefreshed = callbacks.onTokenRefreshed || null;
  onUserUpdated = callbacks.onUserUpdated || null;
}

// Actualizar el token en axios
export function setAuthToken(token: string | null) {
  if (token) {
    authHttp.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete authHttp.defaults.headers.common.Authorization;
  }
}

// Interceptor de request - agregar token y detectar expiración
authHttp.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const session: AuthSession | null = authStorage.get();
  if (session?.token) {
    const headers = new AxiosHeaders(config.headers ?? {});
    headers.set("Authorization", `Bearer ${session.token}`);
    config.headers = headers;
  }
  return config;
});

/**
 * Intenta renovar el token de forma segura
 * Evita múltiples refresh simultáneos
 * También obtiene datos actualizados del usuario
 */
async function attemptTokenRefresh(): Promise<string | null> {
  // Si ya hay un refresh en curso, esperar a que termine
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const session = authStorage.get();

      const { token: newToken } = await authService.refresh();

      // Actualizar el token en storage y axios
      if (session) {
        const updatedSession: AuthSession = { ...session, token: newToken };
        authStorage.set(updatedSession);
        setAuthToken(newToken);

        // Notificar al Context que el token fue renovado
        if (onTokenRefreshed) {
          onTokenRefreshed(newToken);
        }

        // Obtener datos actualizados del usuario
        try {
          const updatedUser = await authService.me();
          const finalSession: AuthSession = {
            token: newToken,
            user: updatedUser,
          };
          authStorage.set(finalSession);

          // Notificar al Context que los datos del usuario fueron actualizados
          if (onUserUpdated) {
            onUserUpdated(updatedUser);
          }
        } catch {
          // Si no se pueden obtener los datos del usuario actualizados,
          // mantenemos el nuevo token para no bloquear la sesión.
        }

        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Interceptor de response - manejar errores y refresh automático
authHttp.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig | undefined;
    if (!config) return Promise.reject(error);

    // Si es 401 y el token expiró, intentar refresh una sola vez
    if (error.response?.status === 401 && !config.__refreshRetried) {
      config.__refreshRetried = true;

      const newToken = await attemptTokenRefresh();

      if (newToken) {
        // Reintentar la solicitud original con el nuevo token
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newToken}`;
        return authHttp(config);
      }
    }

    // Si el refresh falla o no hay token válido, limpiar autenticación
    if (error.response?.status === 401) {
      authStorage.clear();
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        window.location.href = "/Login";
      }
    }

    return Promise.reject(error);
  },
);
