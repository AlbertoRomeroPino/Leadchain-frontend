import { createContext } from "react";
import type { AuthSession, User } from "../types";

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);