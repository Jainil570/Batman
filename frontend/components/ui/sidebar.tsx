"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user?: any;
  chats?: Array<{ id: string; title: string; updated_at: string }>;
  documents?: Array<{ id: string; filename: string }>;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    )
  },
  {
    label: "Chats",
    href: "/dashboard#chats",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
      </svg>
    )
  },
  {
    label: "Files",
    href: "/dashboard#files",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    )
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    )
  }
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const userName = user?.name || "Bruce Wayne";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        aside.dash-sidebar {
          width: var(--sidebar-w);
          min-width: var(--sidebar-w);
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          padding: 0;
          position: relative;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          animation: sideIn .9s cubic-bezier(.16,1,.3,1) both;
        }
        @keyframes sideIn { from { transform: translateX(-30px); opacity: 0; } to { transform: none; opacity: 1; } }

        /* sidebar top glow line */
        aside.dash-sidebar::after {
          content: '';
          position: absolute; top: 0; right: -1px; bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,.12) 30%, rgba(255,255,255,.06) 70%, transparent);
          pointer-events: none;
        }

        .sidebar-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 28px 22px 24px;
          border-bottom: 1px solid var(--border);
        }
        
        .logo-wrap { position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .logo-svg { width: 22px; height: 22px; z-index: 1; }
        
        .brand { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,.82); text-shadow: 0 0 20px rgba(255,255,255,.25); }

        /* nav */
        .dash-nav { flex: 1; padding: 20px 0; }
        .nav-section-label {
          font-size: 8px; font-weight: 500; letter-spacing: 3.5px; text-transform: uppercase;
          color: rgba(255,255,255,.2); padding: 0 22px 10px; margin-top: 8px;
        }
        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 22px;
          font-size: 11px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;
          color: var(--muted); cursor: pointer; position: relative;
          transition: color .3s, background .3s;
          border-left: 2px solid transparent;
          user-select: none;
          text-decoration: none;
        }
        .nav-item:hover { color: rgba(255,255,255,.75); background: rgba(255,255,255,.03); }
        .nav-item.active {
          color: #fff; background: rgba(255,255,255,.05);
          border-left-color: rgba(255,255,255,.7);
        }
        .nav-item.active::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,.06) 0%, transparent 100%);
        }
        .nav-icon { width: 15px; height: 15px; flex-shrink: 0; opacity: .7; }
        .nav-item.active .nav-icon { opacity: 1; }

        /* user bottom */
        .sidebar-bottom {
          border-top: 1px solid var(--border);
          padding: 18px 22px;
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; transition: background .3s;
        }
        .sidebar-bottom:hover { background: rgba(255,255,255,.03); }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; color: #fff;
        }
        .user-info { flex: 1; min-width: 0; }
        .user-name { font-size: 11px; font-weight: 500; letter-spacing: 1px; color: rgba(255,255,255,.8); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-top: 2px; }
      `}} />

      <aside className="dash-sidebar hidden md:flex">
        <div className="sidebar-logo">
          <div className="logo-wrap">
            <svg className="logo-svg" viewBox="0 0 100 60" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/>
            </svg>
          </div>
          <span className="brand">Batman AI</span>
        </div>

        <nav className="dash-nav">
          <div className="nav-section-label">Navigation</div>
          
          {navItems.map((item) => {
            // Simplified active checking
            const isActive = pathname === item.href || (item.href.includes('#') && pathname === item.href.split('#')[0]);
            
            return (
              <Link 
                key={item.label}
                href={item.href}
                className={cn("nav-item", isActive && "active")}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">{initial}</div>
          <div className="user-info">
            <div className="user-name">{userName}</div>
            <div className="user-role">Knight Tier</div>
          </div>
        </div>
      </aside>
    </>
  );
}
