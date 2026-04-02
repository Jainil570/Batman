/**
 * Batman AI - Mobile Bottom Navigation
 * Bottom nav bar for mobile viewports.
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: MessageSquare, label: "Chats", href: "/dashboard" },
  { icon: FileText, label: "Files", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-batman-charcoal)] border-t border-[var(--color-batman-border)] backdrop-blur-xl">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors",
                isActive
                  ? "text-[var(--color-accent-blue)]"
                  : "text-[var(--color-batman-muted)]"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
