"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
import { useSession } from "@/hooks/use-session";
import { chatApi, docsApi } from "@/lib/api";
import { DashboardSkeleton } from "@/components/ui/skeleton-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, loading } = useSession(true);
  const [chats, setChats] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [chatList, docList] = await Promise.all([
          chatApi.list(token),
          docsApi.list(token),
        ]);
        setChats(chatList as any[]);
        setDocuments(docList as any[]);
      } catch (err) {
        console.error("Failed to load sidebar data:", err);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--black)] relative z-50">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Raleway:wght@200;300;400;500;600&family=Orbitron:wght@400;500;700&display=swap');

        :root {
          --black: #000;
          --deep: #060606;
          --sidebar-bg: rgba(6,6,6,0.96);
          --panel: rgba(12,12,12,0.85);
          --panel-hover: rgba(20,20,20,0.9);
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.16);
          --text: #d8d8d8;
          --muted: rgba(255,255,255,0.32);
          --accent: #fff;
          --sidebar-w: 220px;
        }

        body { font-family: 'Raleway', sans-serif; font-weight: 300; background: var(--black); color: var(--text); overflow: hidden; }

        /* ── BG ── */
        .dash-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 90% at 20% 50%, rgba(22,22,22,0.5) 0%, transparent 65%),
            url('https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=1800&q=80&auto=format&fit=crop') right center / cover no-repeat;
          filter: grayscale(100%) contrast(1.05) brightness(0.18);
          transform: scale(1.03);
          pointer-events: none;
        }
        .dash-grain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .28;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px; animation: grain .4s steps(1) infinite;
        }
        @keyframes grain {
          0%  { background-position:  0    0;    }
          25% { background-position: -35px 18px; }
          50% { background-position:  28px -12px; }
          75% { background-position: -18px -28px; }
        }
        .dash-scanlines {
          position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: .03;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,.04) 2px, rgba(255,255,255,.04) 4px);
        }
        .dash-vignette {
          position: fixed; inset: 0; z-index: 3; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,.88) 100%);
        }

        /* ── LAYOUT ── */
        .dash-app { position: relative; z-index: 10; display: flex; height: 100vh; }
        
        /* ── MAIN ── */
        .dash-main {
          flex: 1; overflow-y: auto; overflow-x: hidden;
          padding: 40px 44px;
          animation: mainIn .9s cubic-bezier(.16,1,.3,1) .15s both;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent;
        }
        .dash-main::-webkit-scrollbar { width: 4px; }
        .dash-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,.08); border-radius: 2px; }
        @keyframes mainIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
      `}} />

      <div className="dash-bg"></div>
      <div className="dash-grain"></div>
      <div className="dash-scanlines"></div>
      <div className="dash-vignette"></div>

      <div className="dash-app">
        <Sidebar user={user} chats={chats} documents={documents} />
        <main className="dash-main">{children}</main>
      </div>

      {/* Adding mobile navigation fallback */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 z-50">
        <MobileNav />
      </div>
    </>
  );
}
