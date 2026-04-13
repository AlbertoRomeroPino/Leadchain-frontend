import type { AuthResponse, LoginCredentials, RegisterData, User } from "../types/users/User";
import { authHttp, publicHttp } from "./https";

function normalizeAuthResponse(payload: unknown): AuthResponse {
  const raw = payload as {
    token?: unknown;
    access_token?: unknown;
    user?: unknown;
    data?: {
      token?: unknown;
      access_token?: unknown;
      user?: unknown;
    };
  };

  const tokenCandidate =
    raw?.token ?? raw?.access_token ?? raw?.data?.token ?? raw?.data?.access_token;
  const userCandidate = raw?.user ?? raw?.data?.user;

  if (typeof tokenCandidate !== "string" || !userCandidate) {
    throw new Error("La respuesta de autenticación no contiene token o usuario válidos.");
  }

  return {
    token: tokenCandidate,
    user: userCandidate as User,
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await publicHttp.post<unknown>("/api/auth/login", credentials);
    return normalizeAuthResponse(response.data);
  },

  async logout(data: RegisterData): Promise<void> {
    await authHttp.post("/api/auth/logout", data);
  },

  async refresh(): Promise<AuthResponse> {
    const response = await authHttp.post<unknown>("/api/auth/refresh");
    return normalizeAuthResponse(response.data);
  },

  async me(): Promise<User> {
    const response = await authHttp.get<{ success: boolean; user: User; dashboard: string }>("/api/auth/me");
    return response.data.user;
  },
};
