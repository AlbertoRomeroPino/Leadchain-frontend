import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthSession, User } from "../types";
import { authStorage } from "./authStorage";
import { setAuthCallbacks, setAuthToken } from "../services/https";
import { AuthContext, type AuthContextValue } from "./AuthContext";

type AuthPayload = {
  user?: User;
};

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

function isAuthPayload(value: unknown): value is AuthPayload {
  return typeof value === "object" && value !== null && "user" in value;
}

function resolveStoredUser(session: AuthSession | null): User | null {
  const rawUser: unknown = session?.user;

  if (!rawUser) {
    return null;
  }

  if (isUser(rawUser)) {
    return rawUser;
  }

  if (isAuthPayload(rawUser) && isUser(rawUser.user)) {
    return rawUser.user;
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Verificar si la sesión ha expirado
  const initial: AuthSession | null = authStorage.isSessionExpired() ? null : authStorage.get();

  // Extraer usuario correctamente desde localStorage
  const initialUser = resolveStoredUser(initial);

  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [token, setToken] = useState<string | null>(initial?.token ?? null);

  const logout = useCallback(() => {
    authStorage.clear();
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  const login = useCallback((session: AuthSession) => {
    authStorage.set(session);
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
  }, []);

  const updateUser = useCallback((userData: User | Partial<User>) => {
    setUser((prevUser) => {
      const updated = { ...(prevUser || {}), ...(userData || {}) } as User;
      return updated;
    });
  }, []);

  // Sincronizar cambios de usuario y token a localStorage
  useEffect(() => {
    if (user && token) {
      authStorage.set({ token, user });
    }
  }, [user, token]);

  // Verificar periódicamente si la sesión ha expirado
  useEffect(() => {
    const checkSessionExpiry = () => {
      if (authStorage.isSessionExpired()) {
        logout();
      }
    };

    // Verificar cada minuto si la sesión expiró
    const interval = setInterval(checkSessionExpiry, 60000);

    return () => clearInterval(interval);
  }, [logout]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    setAuthCallbacks({
      onUnauthorized: () => {
        logout();
      },
      onTokenRefreshed: (newToken) => {
        // Actualizar el token en el estado cuando se renueve automáticamente
        setToken(newToken);
      },
      onUserUpdated: (updatedUser) => {
        // Normalizar payload por compatibilidad con datos viejos en storage
        const userToUse = resolveStoredUser({
          token: token ?? "",
          user: updatedUser as User,
        });

        if (userToUse) {
          setUser(userToUse);
        } else {
          setUser(updatedUser);
        }
      },
    });
  }, [logout, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser,
    }),
    [user, token, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}