import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosRequestConfig } from "axios";
import type { AuthSession, User } from "../types/users/User";
import { authStorage } from "../auth/authStorage";
import { isTokenExpiringIn } from "./tokenManager";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "/";

// Tipo extendido para configuración de request con propiedades personalizadas
type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  __shouldRefreshToken?: boolean;
  __refreshRetried?: boolean;
};

// Configuración para evitar errores HTTP/2 en tunnels de GitHub
const axiosConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
};

// Si estamos en devtunnels, deshabilitar HTTP/2 para evitar ERR_HTTP2_PROTOCOL_ERROR
if (API_BASE_URL.includes("devtunnels.ms")) {
  // En navegadores no podemos controlar directamente HTTP/2, pero podemos desabilitar keep-alive
  axiosConfig.httpAgent = { keepAlive: false };
  axiosConfig.httpsAgent = { keepAlive: false };
}

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
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.token}`;

    // Verificar si el token está por expirar (en los próximos 5 minutos = 300 segundos)
    if (isTokenExpiringIn(session.token, 300)) {
      // Marcar la solicitud para posible refresh después de respuesta
      config.__shouldRefreshToken = true;
    }
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
      // Importar aquí para evitar circularidad
      const { authService } = await import("./authService");

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
          const finalSession: AuthSession = { token: newToken, user: updatedUser };
          authStorage.set(finalSession);

          // Notificar al Context que los datos del usuario fueron actualizados
          if (onUserUpdated) {
            onUserUpdated(updatedUser);
          }
        } catch (error) {
          // No es crítico si falla, el token ya se renovó
        }

        return newToken;
      }
      return null;
    } catch (error) {
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

    // Retry automático para errores HTTP/2 en tunnels de GitHub
    if (
      error.message === "Network Error" &&
      API_BASE_URL.includes("devtunnels.ms") &&
      !config.__refreshRetried
    ) {
      config.__refreshRetried = true;
      // Esperar 500ms y reintentar
      await new Promise((resolve) => setTimeout(resolve, 500));
      return authHttp(config);
    }

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
  }
);
