import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthSession, User } from "../types/User";
import { authStorage } from "./authStorage";
import { setAuthCallbacks, setAuthToken } from "../services/https";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial: AuthSession | null = authStorage.get();

  const [user, setUser] = useState<User | null>(initial?.user ?? null);
  const [token, setToken] = useState<string | null>(initial?.token ?? null);

  // Sincronizar token con axios al iniciar
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  // Configurar callbacks de autenticación
  useEffect(() => {
    setAuthCallbacks({
      onUnauthorized: () => {
        logout();
      },
    });
  }, []);

  function login(session: AuthSession) {
    authStorage.set(session);
    setUser(session.user);
    setToken(session.token);
    setAuthToken(session.token);
  }

  function logout() {
    authStorage.clear();
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }

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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser,
    }),
    [user, token, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  }
  return context;
}