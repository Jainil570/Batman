"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function HeroPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isExiting, setIsExiting] = useState(false);

  const handleGuestAccess = () => {
    const guestData = {
      user: { id: "guest-123", name: "Guest User", email: "guest@wayne.com", created_at: new Date().toISOString() },
      access_token: "mock-guest-token-abc",
    };
    login(guestData as any);
    setIsExiting(true);
    setTimeout(() => router.push("/dashboard"), 600);
  };

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push(href);
    }, 600); // Wait for transition
  };

  return (
    <div className="min-h-screen bg-[url('/image3.jpg')] bg-cover bg-center bg-no-repeat bg-fixed relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <style dangerouslySetInnerHTML={{__html: `
        .btn {
          font-size: 17px;
          background: transparent;
          border: none;
          padding: 1em 1.5em;
          color: #ffffff;
          text-transform: uppercase;
          position: relative;
          transition: 0.5s ease;
          cursor: pointer;
          z-index: 1;
        }
        .btn::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0;
          background-color: #ffffff;
          transition: 0.5s ease;
        }
        .btn:hover {
          color: #1e1e2b;
          transition-delay: 0.5s;
        }
        .btn:hover::before {
          width: 100%;
        }
        .btn::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 0;
          width: 100%;
          background-color: #ffffff;
          transition: 0.4s ease;
          z-index: -1;
        }
        .btn:hover::after {
          height: 100%;
          transition-delay: 0.4s;
          color: aliceblue;
        }
      `}} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 w-full">
        {/* Top Left Logo */}
        <div className="flex items-center">
          <div className="w-10 h-10 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 60" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/>
            </svg>
          </div>
        </div>

        {/* Top Right Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" onClick={(e) => handleNavigation(e, "/login")}>
            <button className="btn">
              Log In
            </button>
          </Link>

          <Link href="/signup" onClick={(e) => handleNavigation(e, "/signup")}>
            <button className="btn">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)", y: 0 }}
           animate={{ 
             opacity: isExiting ? 0 : 1, 
             scale: isExiting ? 0.95 : 1, 
             filter: isExiting ? "blur(10px)" : "blur(0px)",
             y: isExiting ? -40 : 0
           }}
           transition={{ duration: isExiting ? 0.5 : 1.5, ease: isExiting ? "easeIn" : "easeOut" }}
           className="flex flex-col items-center"
        >
          <span className="text-2xl md:text-5xl font-light text-white uppercase tracking-[0.3em] mb-4 opacity-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]">
            Study Smarter with
          </span>
          <h1 className="text-7xl md:text-[12rem] font-fiorello font-black text-white uppercase tracking-normal drop-shadow-[0_0_40px_rgba(255,255,255,0.4)] leading-none mt-2">
            Batman AI
          </h1>
          <button
            onClick={handleGuestAccess}
            style={{
              marginTop: '2rem',
              padding: '14px 36px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '3px',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
          >
            Try Demo →
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-auto py-8 flex justify-center items-center pointer-events-none">
        <p className="text-xs text-[#a1a1aa] text-center max-w-md bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          © 2026 Batman AI.
        </p>
      </footer>
    </div>
  );
}
