import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthSession, User } from "../types/users/User";
import { authStorage } from "./authStorage";
import { setAuthCallbacks, setAuthToken } from "../services/https";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial: AuthSession | null = authStorage.get();
  
  // Extraer usuario correctamente desde localStorage
  let initialUser: User | null = null;
  if (initial?.user) {
    // Si localStorage contiene la respuesta completa por error anterior
    if ('user' in initial.user && !('nombre' in initial.user)) {
      initialUser = (initial.user as any).user;
    } else {
      initialUser = initial.user as User;
    }
  }

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
        // Actualizar datos del usuario cuando se obtienen del endpoint /me
        // Validar que no sea la respuesta completa
        let userToUse = updatedUser;
        if ('user' in updatedUser && typeof (updatedUser as any).user === 'object' && !('nombre' in updatedUser)) {
          userToUse = (updatedUser as any).user;
        }
        setUser(userToUse as User);
      },
    });
  }, [logout]);

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