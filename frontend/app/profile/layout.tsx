/**
 * Batman AI - Profile Layout
 */
"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopBar } from "@/components/ui/topbar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "@/hooks/use-session";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useSession(true);

  if (loading) return null;

  return (
    <div className="flex min-h-screen bg-[var(--color-batman-black)]">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
