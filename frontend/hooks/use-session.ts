/**
 * Batman AI - Session Hook
 * Auth session management for client components.
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser, clearAuth, type User } from "@/lib/auth";

export function useSession(requireAuth: boolean = true) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    } else if (requireAuth) {
      router.push("/login");
    }

    setLoading(false);
  }, [requireAuth, router]);

  const logout = () => {
    clearAuth();
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return { user, token, loading, logout };
}
