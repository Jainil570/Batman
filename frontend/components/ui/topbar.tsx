/**
 * Batman AI - Top Bar Component
 * Transparent blur header with theme toggle and user dropdown.
 */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, LogOut, User, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-[var(--color-batman-black)]/80 backdrop-blur-xl border-b border-[var(--color-batman-border)]">
      {/* Left - Page title area */}
      <div />

      {/* Right - Controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--color-batman-muted)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-batman-panel)] transition-all"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* User dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdown(!dropdown)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.2)] flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <ChevronDown size={14} className="text-[var(--color-batman-muted)]" />
            </button>

            <AnimatePresence>
              {dropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl py-2 shadow-2xl overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
                    <p className="text-sm font-semibold text-white tracking-wide">
                      {user.name}
                    </p>
                    <p className="text-xs text-[rgba(255,255,255,0.4)] mt-0.5">{user.email}</p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-widest text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.04)] hover:text-white transition-colors"
                    >
                      <User size={14} />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 text-xs uppercase tracking-widest text-[rgba(255,100,100,0.8)] hover:bg-[rgba(255,100,100,0.08)] hover:text-[#ff7777] transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
