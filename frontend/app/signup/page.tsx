"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authApi } from "@/lib/api";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await authApi.signup({ name, email, password }) as any;
      login(data);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #000000;
    --deep: #080808;
    --charcoal: #111111;
    --panel: rgba(10,10,10,0.88);
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.18);
    --text: #e8e8e8;
    --muted: rgba(255,255,255,0.38);
    --accent: #ffffff;
    --glow: rgba(255,255,255,0.12);
    --input-bg: rgba(255,255,255,0.04);
  }

  .signup-container {
    height: 100vh;
    width: 100vw;
    background: var(--black);
    color: var(--text);
    font-family: 'Raleway', sans-serif;
    font-weight: 300;
    overflow: hidden;
    position: relative;
  }

  /* ── CINEMATIC BACKGROUND ── */
  .bg-wrapper {
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
    animation: bgFadeIn 1s ease-in-out forwards;
  }
  @keyframes bgFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 60% 80% at 50% 40%, rgba(30,30,30,0.7) 0%, transparent 70%),
      radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0,0,0,1) 0%, transparent 60%),
      url('/image6.jpg') center/cover no-repeat;
    filter: grayscale(100%) contrast(1.1) brightness(0.35);
    transform: scale(1.04);
    animation: subtleDrift 18s ease-in-out infinite alternate;
  }
  @keyframes subtleDrift {
    from { transform: scale(1.04) translateX(0); }
    to   { transform: scale(1.07) translateX(-12px); }
  }

  /* grain overlay */
  .grain {
    position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: .35;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 180px 180px;
    animation: grainShift 0.4s steps(1) infinite;
  }
  @keyframes grainShift {
    0%  { background-position: 0 0; }
    25% { background-position: -40px 20px; }
    50% { background-position: 30px -15px; }
    75% { background-position: -20px -30px; }
  }

  /* vignette */
  .vignette {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%);
  }

  /* horizontal scan lines */
  .scanlines {
    position: absolute; inset: 0; z-index: 3; pointer-events: none; opacity: .04;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px);
  }

  /* ── NAV / LOGO ── */
  .custom-nav {
    position: absolute; top: 0; left: 0; right: 0; z-index: 100;
    padding: 28px 44px;
    display: flex; align-items: center; gap: 14px;
    animation: fadeDown 1s ease both;
  }
  @keyframes fadeDown { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:none; } }

  .logo-wrap {
    position: relative;
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
  }
  .logo-svg { width: 34px; height: 34px; z-index: 1; }

  .brand-name {
    font-family: 'Orbitron', monospace;
    font-size: 13px; font-weight: 700; letter-spacing: 5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.85);
    text-shadow: 0 0 20px rgba(255,255,255,0.3);
  }

  /* ── LAYOUT ── */
  .main-content {
    position: relative; z-index: 10;
    min-height: 100vh;
    display: flex; align-items: center; justify-content: flex-start;
    padding: 100px 24px 40px 12%;
  }

  /* ── SIGNUP CARD ── */
  .card {
    width: 100%; max-width: 420px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 52px 44px 44px;
    backdrop-filter: blur(28px) saturate(0.8);
    -webkit-backdrop-filter: blur(28px) saturate(0.8);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 40px 80px rgba(0,0,0,0.8),
      0 0 60px rgba(0,0,0,0.5);
    animation: cardReveal 1.1s cubic-bezier(0.16,1,0.3,1) 0.3s both;
    position: relative; overflow: hidden;
  }
  @keyframes cardReveal {
    from { opacity: 0; transform: translateY(36px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .card::before {
    content: '';
    position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
  }

  .card::after {
    content: '';
    position: absolute; top: -60px; right: -60px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
    pointer-events: none;
  }

  .card-headline {
    font-family: 'Cinzel', serif;
    font-size: 22px; font-weight: 700; letter-spacing: 3px;
    text-transform: uppercase;
    color: #fff;
    margin-bottom: 8px;
    text-shadow: 0 0 30px rgba(255,255,255,0.2);
    animation: fadeUp 0.8s ease 0.6s both;
  }
  .card-sub {
    font-size: 11px; font-weight: 300; letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 40px;
    animation: fadeUp 0.8s ease 0.7s both;
  }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

  /* ── FORM ── */
  .field {
    position: relative; margin-bottom: 22px;
    animation: fadeUp 0.8s ease both;
  }
  .field:nth-child(1) { animation-delay: 0.75s; }
  .field:nth-child(2) { animation-delay: 0.85s; }
  .field:nth-child(3) { animation-delay: 0.95s; }

  label {
    display: block; font-size: 9px; font-weight: 500;
    letter-spacing: 3px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px;
    transition: color 0.3s;
  }
  .field:focus-within label { color: rgba(255,255,255,0.7); }

  .custom-input {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 13px 16px;
    font-family: 'Raleway', sans-serif;
    font-size: 13px; font-weight: 400; letter-spacing: 0.5px;
    color: #fff;
    outline: none;
    transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
    caret-color: rgba(255,255,255,0.7);
  }
  .custom-input::placeholder { color: rgba(255,255,255,0.2); font-weight: 300; }
  .custom-input:focus {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.5);
  }

  .pw-wrap { position: relative; }
  .pw-toggle {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px;
    color: var(--muted); transition: color 0.3s;
  }
  .pw-toggle:hover { color: rgba(255,255,255,0.7); }

  /* ── DIVIDER ── */
  .divider {
    display: flex; align-items: center; gap: 14px;
    margin: 28px 0 24px;
    animation: fadeUp 0.8s ease 1s both;
  }
  .divider-line { flex: 1; height: 1px; background: var(--border); }
  .divider span {
    font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted);
  }

  /* ── BUTTON (custom arrow style, reversed) ── */
  .btn-wrap {
    animation: fadeUp 0.8s ease 1.05s both;
    margin-bottom: 0;
  }

  button.arrow-btn {
    position: relative;
    display: inline-block;
    cursor: pointer;
    outline: none;
    border: 0;
    vertical-align: middle;
    text-decoration: none;
    background: transparent;
    padding: 0;
    font-size: inherit;
    font-family: inherit;
    width: 100%;
    height: 52px;
  }
  button.arrow-btn .circle {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: absolute;
    right: 0; top: 0; bottom: 0; margin: auto;
    display: block;
    width: 52px; height: 52px;
    background: #ffffff;
    border-radius: 26px;
  }
  button.arrow-btn .circle .icon {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: absolute; top: 0; bottom: 0; margin: auto;
    background: #111;
  }
  button.arrow-btn .circle .icon.arrow {
    right: 14px; left: auto;
    width: 18px; height: 2px;
    background: none;
  }
  button.arrow-btn .circle .icon.arrow::before {
    position: absolute; content: '';
    top: -5px; right: 1px;
    width: 10px; height: 10px;
    border-top: 2px solid #111;
    border-right: 2px solid #111;
    transform: rotate(45deg);
  }
  button.arrow-btn .button-text {
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
    position: absolute; top: 0; left: 0; right: 52px; bottom: 0;
    padding: 0 0 0 20px;
    display: flex; align-items: center;
    color: #ffffff;
    font-family: 'Orbitron', monospace;
    font-weight: 700; font-size: 10px; letter-spacing: 4px;
    text-transform: uppercase;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 2px 0 0 2px;
    transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
  }
  button.arrow-btn:hover:not(:disabled) .circle {
    width: 100%;
    border-radius: 2px;
  }
  button.arrow-btn:hover:not(:disabled) .circle .icon.arrow {
    background: #111;
    transform: translate(-6px, 0);
  }
  button.arrow-btn:hover:not(:disabled) .button-text {
    color: #111;
    background: transparent;
    border-color: transparent;
  }
  button.arrow-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* ── SIGN IN LINK ── */
  .signin-row {
    margin-top: 28px; text-align: center;
    animation: fadeUp 0.8s ease 1.1s both;
  }
  .signin-row p {
    font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase;
    color: var(--muted);
  }
  .signin-row a {
    color: rgba(255,255,255,0.75);
    text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 1px;
    transition: color 0.3s, border-color 0.3s;
  }
  .signin-row a:hover { color: #fff; border-color: #fff; }

  /* ── BOTTOM TAGLINE ── */
  .tagline {
    position: absolute; bottom: 32px; left: 0; right: 0; text-align: center;
    z-index: 10;
    font-family: 'Cinzel', serif;
    font-size: 10px; letter-spacing: 6px; text-transform: uppercase;
    color: rgba(255,255,255,0.12);
    animation: fadeUp 1.5s ease 1.5s both;
  }
        `
      }} />

      <div className="signup-container">
        <div className="bg-wrapper">
          <div className="bg"></div>
          <div className="grain"></div>
          <div className="vignette"></div>
          <div className="scanlines"></div>
        </div>

        <nav className="custom-nav">
          <Link href="/" className="flex items-center gap-[14px] no-underline" style={{ textDecoration: 'none' }}>
            <div className="logo-wrap">
              <svg className="logo-svg" viewBox="0 0 100 60" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/>
              </svg>
            </div>
            <span className="brand-name">Batman AI</span>
          </Link>
        </nav>

        <main className="main-content">
          <div className="card">
            <div className="card-headline">Create Account</div>
            <div className="card-sub">Join Batman AI — Ace your exams</div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input 
                  id="name" 
                  className="custom-input"
                  type="text" 
                  placeholder="Bruce Wayne" 
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email Address</label>
                <input 
                  id="email" 
                  className="custom-input"
                  type="email" 
                  placeholder="bruce@wayne.com" 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="pw-wrap">
                  <input 
                    id="password" 
                    className="custom-input"
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimum 6 characters" 
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="pw-toggle" 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    aria-label="Toggle password"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      {showPassword ? (
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <div className="field">
                  <p className="text-xs text-red-500 text-center" style={{ color: '#ef4444', fontSize: '11px', textAlign: 'center' }}>{error}</p>
                </div>
              )}

              <div className="divider">
                <div className="divider-line"></div>
                <span>Initiate</span>
                <div className="divider-line"></div>
              </div>

              <div className="btn-wrap">
                <button className="arrow-btn" type="submit" disabled={loading}>
                  <span className="circle" aria-hidden="true">
                    <span className="icon arrow"></span>
                  </span>
                  <span className="button-text">{loading ? "Creating..." : "Create Account"}</span>
                </button>
              </div>

              <div className="signin-row">
                <p>Already have an account? <Link href="/login">Sign in</Link></p>
              </div>
            </form>
          </div>
        </main>

        <div className="tagline">The Dark Knight &nbsp;·&nbsp; Intelligence Forged in Shadow</div>
      </div>
    </>
  );
}
