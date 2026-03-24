import axios from "axios";
import type { AuthSession } from "../types/User";
import { authStorage } from "../auth/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const publicHttp = axios.create({ baseURL: API_BASE_URL });
export const authHttp = axios.create({ baseURL: API_BASE_URL });
export const http = authHttp;

// Callbacks para sincronización con el Context
let onUnauthorized: (() => void) | null = null;

export function setAuthCallbacks(callbacks: { onUnauthorized: () => void }) {
  onUnauthorized = callbacks.onUnauthorized;
}

// Actualizar el token en axios
export function setAuthToken(token: string | null) {
  if (token) {
    authHttp.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete authHttp.defaults.headers.common.Authorization;
  }
}

// Interceptor de request - agregar token
authHttp.interceptors.request.use((config) => {
  const session: AuthSession | null = authStorage.get();
  if (session?.token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Interceptor de response - manejar errores
authHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es 401, limpiar autenticación
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
