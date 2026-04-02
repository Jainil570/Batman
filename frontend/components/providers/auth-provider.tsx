/**
 * Batman AI - Auth Provider
 * React context for auth state.
 */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUser, saveAuth, clearAuth, type User, type AuthData } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: AuthData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUser(getUser());
    setToken(getToken());
  }, []);

  const login = (data: AuthData) => {
    saveAuth(data);
    setUser(data.user);
    setToken(data.access_token);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
