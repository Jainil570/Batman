/**
 * Batman AI - Chat Layout
 * Wraps chat pages with sidebar + topbar.
 */
"use client";

import React from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopBar } from "@/components/ui/topbar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "@/hooks/use-session";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
