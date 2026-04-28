import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthSession, User } from "../types";
import { authStorage, resolveUser } from "../auth/authStorage";
import { setAuthCallbacks, setAuthToken } from "../services/https";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicializar desde storage (si no expiró)
  const isExpired = authStorage.isSessionExpired();
  const session = isExpired ? null : authStorage.get();
  const initialUser = session?.user ? resolveUser(session.user) : null;

  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [token, setToken] = useState<string | null>(session?.token ?? null);

  // Memoizar callbacks para evitar recalcular en cada render
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
    setUser((prevUser) => ({
      ...(prevUser || {}),
      ...(userData || {}),
    } as User));
  }, []);

  // Sincronizar user/token a storage + setup interceptors
  useEffect(() => {
    // Guardar a storage cuando cambie
    if (user && token) {
      authStorage.set({ token, user });
    }
    
    // Setear token en headers
    setAuthToken(token);

    // Setup interceptors callbacks
    setAuthCallbacks({
      onUnauthorized: logout,
      onTokenRefreshed: setToken,
      onUserUpdated: (updatedUser) => {
        const resolved = resolveUser(updatedUser);
        setUser(resolved || updatedUser);
      },
    });
  }, [user, token, logout]);

  // Check session expiry cada minuto
  useEffect(() => {
    const checkExpiry = () => {
      if (authStorage.isSessionExpired()) {
        logout();
      }
    };

    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
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
