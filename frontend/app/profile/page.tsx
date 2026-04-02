"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/use-session";
import { useAuth } from "@/components/providers/auth-provider";
import { docsApi, chatApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  Calendar,
  LogOut,
  BarChart3,
  TrendingUp,
} from "lucide-react";

export default function ProfilePage() {
  const { user, token, logout } = useSession(true);
  const [stats, setStats] = useState({ docs: 0, chats: 0 });

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const [docs, chats] = await Promise.all([
          docsApi.list(token),
          chatApi.list(token),
        ]);
        setStats({
          docs: (docs as any[]).length,
          chats: (chats as any[]).length,
        });
      } catch {
        // silent
      }
    };

    fetchStats();
  }, [token]);

  if (!user) return null;

  const statCards = [
    {
      icon: FileText,
      label: "Documents",
      value: stats.docs,
    },
    {
      icon: MessageSquare,
      label: "Conversations",
      value: stats.chats,
    },
    {
      icon: TrendingUp,
      label: "Queries Made",
      value: "—",
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto font-[Raleway]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-3xl font-[Cinzel] font-bold tracking-[4px] uppercase text-white mb-2">
          Knight Profile
        </h1>
        <p className="text-xs tracking-widest uppercase text-[rgba(255,255,255,0.3)]">
          Account Analytics & Intelligence
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="flex flex-col h-full bg-[rgba(10,10,10,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 relative overflow-hidden group hover:border-[rgba(255,255,255,0.15)] transition-colors">
            {/* Subtle glow effect behind card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-[0.02] blur-3xl rounded-full" />
            
            <div className="flex flex-col items-center flex-1">
              <div className="w-24 h-24 mb-6 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center font-[Orbitron] text-3xl font-bold text-white shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <h2 className="text-xl font-bold text-white tracking-wide mb-1">
                {user.name}
              </h2>
              <p className="text-sm text-[rgba(255,255,255,0.5)] mb-6">{user.email}</p>
              
              <div className="flex items-center gap-2 mb-8 text-xs text-[rgba(255,255,255,0.3)] uppercase tracking-wider">
                <Calendar size={13} />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>

            {/* Bottom Section - Tier & Logout */}
            <div className="mt-auto pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col items-center">
              <div className="text-[10px] tracking-[4px] uppercase text-[rgba(255,255,255,0.4)] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-white opacity-50" />
                Knight Tier
                <div className="w-1 h-1 rounded-full bg-white opacity-50" />
              </div>
              
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl border border-[rgba(255,100,100,0.2)] text-[rgba(255,100,100,0.8)] text-xs uppercase tracking-widest hover:bg-[rgba(255,100,100,0.05)] hover:border-[rgba(255,100,100,0.4)] hover:text-[#ff7777] transition-all"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Stats & Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {statCards.map((stat, i) => (
              <div key={i} className="bg-[rgba(10,10,10,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] transition-colors rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] text-white">
                    <stat.icon size={18} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-[rgba(255,255,255,0.4)]">{stat.label}</span>
                </div>
                <div className="text-3xl font-[Orbitron] font-bold text-white mt-auto">
                  {stat.value}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Usage Chart Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 bg-[rgba(10,10,10,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8 border-b border-[rgba(255,255,255,0.06)] pb-4">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-white opacity-70" />
                <h3 className="font-semibold text-white tracking-widest uppercase text-xs">
                  Weekly Activity Intelligence
                </h3>
              </div>
            </div>
            
            <div className="flex items-end justify-between h-48 px-2 md:px-8">
              {[30, 45, 20, 60, 80, 55, 70].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: \`\${h}%\` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.8, ease: "easeOut" }}
                    className="w-8 md:w-12 rounded-t-md bg-[rgba(255,255,255,0.08)] border-x border-t border-[rgba(255,255,255,0.1)] group-hover:bg-[rgba(255,255,255,0.15)] transition-colors relative overflow-hidden"
                  >
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(255,255,255,0.1)] to-transparent" />
                  </motion.div>
                  <span className="text-[9px] uppercase tracking-[2px] text-[rgba(255,255,255,0.3)] group-hover:text-white transition-colors">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
