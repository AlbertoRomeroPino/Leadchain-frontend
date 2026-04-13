import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthSession, User } from "../types/users/User";
import { authStorage } from "./authStorage";
import { setAuthCallbacks, setAuthToken } from "../services/https";
import { AuthContext, type AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial: AuthSession | null = authStorage.get();

  const [user, setUser] = useState<User | null>(initial?.user ?? null);
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

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((currentUser) => {
      if (currentUser) {
        const updatedUser = { ...currentUser, ...userData };
        if (token) {
          authStorage.set({ token, user: updatedUser });
        }
        return updatedUser;
      }
      return currentUser;
    });
  }, [token]);

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
        setUser(updatedUser);
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