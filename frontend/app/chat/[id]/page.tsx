"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSession } from "@/hooks/use-session";
import { chatApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";

// Helper to group chats by date easily
function groupChatsByDate(chats: any[]) {
  const groups: { [key: string]: any[] } = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  const now = new Date();
  
  chats.forEach(c => {
    const d = new Date(c.updated_at);
    // Simple mock logic for grouping
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) groups.Today.push(c);
    else if (diffDays === 1) groups.Yesterday.push(c);
    else if (diffDays <= 7) groups["This Week"].push(c);
    else groups.Older.push(c);
  });
  
  return groups;
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const router = useRouter();
  const { user, token } = useSession(true);
  const { messages, stream, connected, error, sendMessage, loadMessages } = useChatStream(chatId);
  
  const [input, setInput] = useState("");
  const [chatTitle, setChatTitle] = useState("Loading...");
  const [allChats, setAllChats] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Load this chat & the sidebar chats list
  useEffect(() => {
    if (!token || !chatId) return;

    const loadData = async () => {
      try {
        const [chatData, chatList] = await Promise.all([
          chatApi.get(chatId, token),
          chatApi.list(token)
        ]) as any;
        
        setChatTitle(chatData.title);
        loadMessages(chatData.messages || []);
        setAllChats(chatList);
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };
    loadData();
  }, [token, chatId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, stream.currentTokens]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || stream.isStreaming) return;
    setInput("");
    sendMessage(msg);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
    setInput(e.target.value);
  };

  const fillInput = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const downloadTranscript = () => {
    let txt = 'BATMAN AI — CHAT TRANSCRIPT\n' + '─'.repeat(44) + '\n\n';
    messages.forEach(m => {
      const who = m.role === 'user' ? 'You' : 'Batman AI';
      txt += `[${who}]\n${m.content}\n\n`;
    });
    const a = document.createElement('a'); 
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt); 
    a.download = 'batman-ai-chat.txt'; 
    a.click();
  };

  const copyToClipboard = (text: string, e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(text);
    const btn = e.currentTarget;
    btn.style.color = 'rgba(255,255,255,.75)';
    setTimeout(() => btn.style.color = '', 1200);
  };

  const createNewChat = () => {
    router.push('/dashboard');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "B";
  const firstName = user?.name ? user.name.split(" ")[0] : "Bruce Wayne";
  
  const groupedChats = groupChatsByDate(allChats);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@200;300;400;500;600&family=Orbitron:wght@400;500;700&display=swap');

        :root {
          --black: #000;
          --sidebar-bg: rgba(5,5,5,0.97);
          --main-bg: #070707;
          --border: rgba(255,255,255,0.06);
          --border-hover: rgba(255,255,255,0.14);
          --text: #d0d0d0;
          --muted: rgba(255,255,255,0.3);
          --sidebar-w: 260px;
        }

        body { font-family: 'Raleway', sans-serif; font-weight: 300; background: var(--black); color: var(--text); overflow: hidden; }

        .chat-view-grain {
          position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .13;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px; animation: grain .5s steps(1) infinite;
        }
        @keyframes grain { 0%{background-position:0 0} 33%{background-position:-30px 15px} 66%{background-position:20px -10px} }

        .chat-app { position: relative; z-index: 10; display: flex; height: 100vh; overflow: hidden; }

        /* ══ SIDEBAR ══ */
        aside.c-sidebar {
          width: var(--sidebar-w); min-width: var(--sidebar-w);
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          backdrop-filter: blur(30px); -webkit-backdrop-filter: blur(30px);
          position: relative;
        }
        aside.c-sidebar::after {
          content: ''; position: absolute; top: 0; left: calc(var(--sidebar-w) - 1px); bottom: 0; width: 1px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,.1) 30%, rgba(255,255,255,.05) 70%, transparent);
          pointer-events: none; z-index: 2;
        }

        .sidebar-logo {
          display: flex; align-items: center; gap: 12px;
          padding: 22px 18px 20px;
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .logo-wrap { position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .logo-svg { width: 20px; height: 20px; z-index: 1; }
        .brand { font-family: 'Orbitron', monospace; font-size: 10.5px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,.8); }

        .new-chat-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin: 14px 12px 8px; padding: 10px 14px;
          background: rgba(255,255,255,.05); border: 1px solid var(--border-hover);
          border-radius: 6px; cursor: pointer; color: rgba(255,255,255,.65);
          font-family: 'Raleway', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;
          transition: all .25s; flex-shrink: 0;
        }
        .new-chat-btn:hover { background: rgba(255,255,255,.09); color: #fff; border-color: rgba(255,255,255,.22); }

        .history-scroll { flex: 1; overflow-y: auto; padding: 2px 0 8px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent; }
        .history-scroll::-webkit-scrollbar { width: 3px; }
        .history-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.06); border-radius: 2px; }

        .history-group-label { font-size: 9px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.18); padding: 14px 18px 5px; }

        .chat-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 18px; cursor: pointer; text-decoration: none;
          font-size: 12px; font-weight: 400; letter-spacing: .2px;
          color: rgba(255,255,255,.45); position: relative; transition: all .2s;
          border-left: 2px solid transparent; overflow: hidden;
        }
        .chat-item:hover { color: rgba(255,255,255,.78); background: rgba(255,255,255,.04); }
        .chat-item.active { color: #fff; background: rgba(255,255,255,.07); border-left-color: rgba(255,255,255,.5); }
        .chat-item-icon { flex-shrink: 0; opacity: .4; }
        .chat-item.active .chat-item-icon { opacity: .75; }
        .chat-item-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .nav-section { border-top: 1px solid var(--border); padding: 8px 0; flex-shrink: 0; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 9px 18px;
          font-size: 11px; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--muted); cursor: pointer; transition: color .2s, background .2s; border-left: 2px solid transparent; text-decoration: none;
        }
        .nav-item:hover { color: rgba(255,255,255,.7); background: rgba(255,255,255,.03); }
        .nav-item-icon { width: 14px; height: 14px; flex-shrink: 0; }

        .sidebar-bottom {
          border-top: 1px solid var(--border); padding: 14px 18px;
          display: flex; align-items: center; gap: 10px; cursor: pointer; transition: background .2s; flex-shrink: 0;
        }
        .sidebar-bottom:hover { background: rgba(255,255,255,.03); }
        .c-avatar { width: 30px; height: 30px; border-radius: 50%; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.14); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-name { font-size: 11px; font-weight: 500; letter-spacing: .5px; color: rgba(255,255,255,.72); }
        .user-role { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-top: 1px; }

        /* ══ CHAT MAIN ══ */
        .chat-main { flex: 1; display: flex; flex-direction: column; background: var(--main-bg); overflow: hidden; position: relative; }

        /* faint bat watermark */
        .chat-bg-art { position: absolute; inset: 0; pointer-events: none; z-index: 0; display: flex; align-items: center; justify-content: center; opacity: .022; }
        .chat-bg-art svg { width: 480px; }

        /* TOPBAR */
        .chat-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 26px; border-bottom: 1px solid var(--border);
          background: rgba(5,5,5,0.92); backdrop-filter: blur(20px);
          flex-shrink: 0; z-index: 10; position: relative;
        }
        .topbar-left { display: flex; align-items: center; gap: 14px; }
        .back-btn { width: 30px; height: 30px; border-radius: 4px; background: rgba(255,255,255,.04); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted); transition: all .2s; }
        .back-btn:hover { background: rgba(255,255,255,.08); color: #fff; border-color: var(--border-hover); }
        .doc-name { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,.88); }
        .doc-status { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(160,255,160,.55); animation: pulse 2.5s ease-in-out infinite; }
        .status-dot.error { background: rgba(255,100,100,.55); }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
        .status-label { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); }
        .topbar-actions { display: flex; align-items: center; gap: 8px; }
        .tbtn { display: flex; align-items: center; gap: 7px; padding: 7px 13px; background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 4px; cursor: pointer; color: var(--muted); font-family: 'Raleway', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; transition: all .2s; }
        .tbtn:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.8); border-color: var(--border-hover); }

        /* MESSAGES */
        .messages-wrap { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 28px 0 10px; position: relative; z-index: 1; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent; }
        .messages-wrap::-webkit-scrollbar { width: 4px; }
        .messages-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,.07); border-radius: 2px; }

        .msg-divider { max-width: 820px; margin: 4px auto 18px; padding: 0 28px; display: flex; align-items: center; gap: 14px; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,.14); white-space: nowrap; }

        .message-row { display: flex; gap: 16px; padding: 12px 28px; max-width: 820px; margin: 0 auto; width: 100%; animation: msgIn .3s cubic-bezier(.16,1,.3,1) both; }
        @keyframes msgIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }

        .msg-av { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 700; }
        .msg-av.ai { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); color: #fff; }
        .msg-av.user { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16); color: #fff; }

        .msg-body { flex: 1; min-width: 0; }
        .msg-who { font-size: 10px; font-weight: 600; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: 7px; }
        .msg-text { font-size: 14px; font-weight: 300; line-height: 1.78; color: rgba(255,255,255,.82); letter-spacing: .2px; }
        .user-bubble { display: inline-block; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08); border-radius: 2px 12px 12px 12px; padding: 11px 16px; max-width: 100%; }

        .msg-tools { display: flex; gap: 3px; margin-top: 10px; opacity: 0; transition: opacity .2s; }
        .message-row:hover .msg-tools { opacity: 1; }
        .mt-btn { width: 27px; height: 27px; border-radius: 4px; background: none; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.28); transition: all .2s; }
        .mt-btn:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.7); }

        /* EMPTY */
        .empty-chat { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; z-index: 1; position: relative; }
        .empty-bat-ring { width: 62px; height: 62px; border-radius: 50%; border: 1px solid rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 22px; box-shadow: 0 0 20px rgba(255,255,255,.08), 0 0 50px rgba(255,255,255,.04); animation: logoGlow 3s ease-in-out infinite alternate; }
        .empty-title { font-family: 'Cinzel', serif; font-size: 17px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 10px; }
        .empty-sub { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.18); line-height: 2.2; }
        .chips { display: flex; flex-wrap: wrap; gap: 9px; justify-content: center; margin-top: 28px; }
        .chip { padding: 9px 18px; background: rgba(255,255,255,.04); border: 1px solid var(--border); border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: 400; letter-spacing: .8px; color: rgba(255,255,255,.4); transition: all .25s; }
        .chip:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.75); border-color: rgba(255,255,255,.18); }

        /* INPUT */
        .input-area { padding: 14px 28px 18px; background: rgba(5,5,5,0.95); border-top: 1px solid var(--border); flex-shrink: 0; z-index: 10; position: relative; backdrop-filter: blur(20px); }
        .input-inner { max-width: 820px; margin: 0 auto; }
        .input-wrap { display: flex; align-items: flex-end; gap: 10px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 11px 12px; transition: border-color .3s, box-shadow .3s; }
        .input-wrap:focus-within { border-color: rgba(255,255,255,.2); box-shadow: 0 0 0 1px rgba(255,255,255,.05), 0 8px 32px rgba(0,0,0,.5); }
        .chat-textarea { flex: 1; background: none; border: none; outline: none; resize: none; font-family: 'Raleway', sans-serif; font-size: 14px; font-weight: 300; letter-spacing: .2px; color: rgba(255,255,255,.85); line-height: 1.6; max-height: 160px; min-height: 24px; caret-color: rgba(255,255,255,.7); scrollbar-width: none; }
        .chat-textarea::placeholder { color: rgba(255,255,255,.2); }
        .chat-textarea::-webkit-scrollbar { display: none; }
        .send-btn { width: 34px; height: 34px; border-radius: 7px; flex-shrink: 0; background: rgba(255,255,255,.9); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .25s; color: #000; }
        .send-btn:hover:not(:disabled) { background: #fff; transform: scale(1.06); }
        .send-btn:disabled { background: rgba(255,255,255,.1); color: rgba(255,255,255,.25); cursor: default; transform: none; }
        .input-footer { text-align: center; margin-top: 8px; font-size: 10px; letter-spacing: 1.5px; color: rgba(255,255,255,.14); }

        /* Disable tailwind prose logic interfering */
        .msg-text p { margin-bottom: 0.75em; }
        .msg-text p:last-child { margin-bottom: 0; }
        .msg-text ul { list-style: disc; margin-left: 1.5em; margin-bottom: 0.75em; }
        .msg-text strong { font-weight: 600; color: #fff; }
        .msg-text code { background: rgba(255,255,255,0.1); padding: 0.1em 0.3em; border-radius: 3px; font-family: monospace; font-size: 0.9em; }

        @media (max-width: 768px) {
          aside.c-sidebar { display: none; }
        }
      `}} />

      <div className="chat-view-grain"></div>

      <div className="chat-app">
        {/* ══ SIDEBAR ══ */}
        <aside className="c-sidebar">
          <div className="sidebar-logo">
            <div className="logo-wrap">
              <svg className="logo-svg" viewBox="0 0 100 60" fill="white">
                <path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/>
              </svg>
            </div>
            <span className="brand">Batman AI</span>
          </div>

          <div className="new-chat-btn" onClick={createNewChat}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            New Chat
          </div>

          <div className="history-scroll">
            {Object.entries(groupedChats).map(([group, groupChats]) => (
              groupChats.length > 0 && (
                <React.Fragment key={group}>
                  <div className="history-group-label">{group}</div>
                  {groupChats.map((c) => (
                    <Link href={`/chat/${c.id}`} key={c.id} className={`chat-item ${c.id === chatId ? 'active' : ''}`}>
                      <svg className="chat-item-icon" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <span className="chat-item-text">{c.title || "Untitled Document"}</span>
                    </Link>
                  ))}
                </React.Fragment>
              )
            ))}
          </div>

          <div className="nav-section">
            <Link href="/dashboard" className="nav-item">
              <svg className="nav-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </Link>
            <Link href="/profile" className="nav-item">
              <svg className="nav-item-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
              Settings
            </Link>
          </div>

          <div className="sidebar-bottom">
            <div className="c-avatar">{initial}</div>
            <div>
              <div className="user-name">{firstName}</div>
              <div className="user-role">Knight Tier</div>
            </div>
          </div>
        </aside>

        {/* ══ CHAT MAIN ══ */}
        <div className="chat-main">
          <div className="chat-bg-art">
            <svg viewBox="0 0 100 60" fill="white"><path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/></svg>
          </div>

          {/* TOPBAR */}
          <div className="chat-topbar">
            <div className="topbar-left">
              <button className="back-btn" onClick={() => router.push('/dashboard')}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
              </button>
              <div>
                <div className="doc-name">{chatTitle || "Untitled Document"}</div>
                <div className="doc-status">
                  <div className={`status-dot ${error ? 'error' : ''}`}></div>
                  <span className="status-label">{error ? error : (connected ? "Connected · Ready" : "Connecting...")}</span>
                </div>
              </div>
            </div>
            <div className="topbar-actions hidden md:flex">
              <button className="tbtn" onClick={downloadTranscript}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Download
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div className="messages-wrap">
            <div className="msg-divider">
              <div className="divider-line"></div>
              <span className="divider-text">Secure Connection Established · {chatTitle}</span>
              <div className="divider-line"></div>
            </div>

            {messages.length === 0 && !stream.isStreaming ? (
              <div className="empty-chat">
                <div className="empty-bat-ring">
                  <svg width="28" height="17" viewBox="0 0 100 60" fill="white"><path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/></svg>
                </div>
                <div className="empty-title">What do you seek, Knight?</div>
                <div className="empty-sub">The Dark Knight awaits your question<br/>Ask anything about your document</div>
                <div className="chips">
                  {["Summarize this document", "Key concepts & definitions", "Create study questions", "Explain the main argument"].map((q, i) => (
                    <button key={i} className="chip" onClick={() => fillInput(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className="message-row">
                    {msg.role === 'user' ? (
                      <div className="msg-av user">{initial}</div>
                    ) : (
                      <div className="msg-av ai">
                        <svg width="13" height="8" viewBox="0 0 100 60" fill="white"><path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/></svg>
                      </div>
                    )}
                    
                    <div className="msg-body">
                      <div className="msg-who">{msg.role === 'user' ? 'You' : 'Batman AI'}</div>
                      <div className="msg-text">
                        {msg.role === 'user' ? (
                          <span className="user-bubble">{msg.content}</span>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        )}
                      </div>
                      
                      {msg.role === 'assistant' && (
                        <div className="msg-tools">
                          <button className="mt-btn" title="Copy" onClick={(e) => copyToClipboard(msg.content, e)}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {stream.isStreaming && (
                  <div className="message-row">
                    <div className="msg-av ai">
                      <svg width="13" height="8" viewBox="0 0 100 60" fill="white"><path d="M50 10 C30 10 10 28 10 28 C20 22 30 26 35 32 C28 30 18 35 18 35 C18 35 22 50 35 50 C42 50 46 44 50 44 C54 44 58 50 65 50 C78 50 82 35 82 35 C82 35 72 30 65 32 C70 26 80 22 90 28 C90 28 70 10 50 10 Z"/></svg>
                    </div>
                    <div className="msg-body">
                      <div className="msg-who">Batman AI</div>
                      <div className="msg-text">
                        {stream.currentTokens ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{stream.currentTokens}</ReactMarkdown>
                        ) : (
                          <span style={{ opacity: .4, letterSpacing: '4px' }}>· · ·</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="input-area">
            <div className="input-inner">
              <div className="input-wrap">
                <textarea 
                  className="chat-textarea"
                  ref={textareaRef}
                  value={input}
                  onChange={autoResize}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your document…" 
                  rows={1} 
                />
                <button 
                  className="send-btn" 
                  onClick={handleSend} 
                  disabled={!input.trim() || stream.isStreaming}
                >
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5m0 0l-7 7m7-7l7 7"/></svg>
                </button>
              </div>
              <div className="input-footer">Batman AI can make mistakes · Always verify important information</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
