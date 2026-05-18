/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { Address } from "@/types/models";

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  addresses: Address[];
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<AuthUser, "firstName" | "lastName" | "email" | "addresses">>) => Promise<void>;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user: AuthUser;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const TOKEN_KEY = "dotstar_token";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest<AuthResponse>("/auth/me", { token });
        if (mounted) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, [token]);

  const persistSession = (data: AuthResponse) => {
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    }
    setUser(data.user);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (email, password) => {
        const data = await apiRequest<AuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        persistSession(data);
        return data.user;
      },
      register: async (payload) => {
        const data = await apiRequest<AuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        persistSession(data);
        return data.user;
      },
      logout: async () => {
        try {
          await apiRequest("/auth/logout", { token });
        } finally {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      },
      updateProfile: async (payload) => {
        const data = await apiRequest<AuthResponse>("/auth/me", {
          method: "PUT",
          token,
          body: JSON.stringify(payload),
        });
        setUser(data.user);
      },
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
