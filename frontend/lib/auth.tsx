"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken, login as apiLogin, me as apiMe, setToken, UserRole, type UserDto } from "./api";

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const existing = getToken();
    if (!existing) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }
    setTokenState(existing);
    try {
      const profile = await apiMe();
      setUser(profile);
    } catch {
      clearToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setToken(result.token);
    setTokenState(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refresh }),
    [user, token, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function roleHome(role: UserDto["role"]): string {
  switch (role) {
    case UserRole.Admin:
      return "/admin";
    case UserRole.Teacher:
      return "/teacher";
    case UserRole.Student:
      return "/student";
    default:
      return "/login";
  }
}
