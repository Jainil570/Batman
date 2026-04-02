"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/use-session";
import { docsApi, chatApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Trash2, MessageSquare, FileText } from "lucide-react";

export default function DashboardPage() {
  const { user, token } = useSession(true);
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [docs, chatList] = await Promise.all([
        docsApi.list(token),
        chatApi.list(token),
      ]);
      setDocuments(docs as any[]);
      setChats(chatList as any[]);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async (file: File) => {
    if (!token) return;
    await docsApi.upload(file, token);
    await fetchData();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        handleUpload(file);
      }
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!token) return;
    await docsApi.delete(docId, token);
    await fetchData();
  };

  const handleNewChat = async (docId: string) => {
    if (!token) return;
    const chat = (await chatApi.create({ document_id: docId }, token)) as any;
    router.push(`/chat/${chat.id}`);
  };

  const initial = user?.name?.charAt(0).toUpperCase() || "J";
  const firstName = user?.name ? user.name.split(" ")[0] : "Bruce";

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        /* ── TOPBAR ── */
        .topbar {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 40px;
        }
        .page-title {
          font-family: 'Cinzel', serif; font-size: 28px; font-weight: 700;
          letter-spacing: 4px; text-transform: uppercase; color: #fff;
          text-shadow: 0 0 40px rgba(255,255,255,.15);
          line-height: 1;
        }
        .page-sub { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-top: 10px; }

        .topbar-actions { display: flex; align-items: center; gap: 14px; }
        .icon-btn {
          width: 38px; height: 38px; border-radius: 2px;
          background: rgba(255,255,255,.04); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .3s; color: var(--muted);
        }
        .icon-btn:hover { background: rgba(255,255,255,.08); border-color: var(--border-hover); color: #fff; }
        .user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 14px 6px 6px;
          background: rgba(255,255,255,.04); border: 1px solid var(--border);
          border-radius: 24px; cursor: pointer; transition: all .3s;
        }
        .user-chip:hover { background: rgba(255,255,255,.08); border-color: var(--border-hover); }
        .chip-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700; color: #fff; }
        .chip-name { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,.7); }

        /* ── STATS ROW ── */
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card {
          background: var(--panel); border: 1px solid var(--border);
          border-radius: 2px; padding: 22px 24px;
          position: relative; overflow: hidden;
          backdrop-filter: blur(20px);
          transition: border-color .3s, transform .3s;
          animation: fadeUp .7s ease both;
        }
        .stat-card:nth-child(1) { animation-delay: .3s; }
        .stat-card:nth-child(2) { animation-delay: .4s; }
        .stat-card:nth-child(3) { animation-delay: .5s; }
        .stat-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent); }
        .stat-label { font-size: 8px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
        .stat-value { font-family: 'Orbitron', monospace; font-size: 26px; font-weight: 700; color: #fff; letter-spacing: 2px; }
        .stat-desc { font-size: 9px; letter-spacing: 1.5px; color: rgba(255,255,255,.25); margin-top: 6px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }

        /* ── UPLOAD ZONE ── */
        .upload-section { margin-bottom: 28px; animation: fadeUp .7s ease .55s both; }
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        .section-title { font-family: 'Cinzel', serif; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.7); }
        .section-count { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }

        .upload-zone {
          background: var(--panel);
          border: 1px dashed rgba(255,255,255,.12);
          border-radius: 2px;
          padding: 44px 32px;
          text-align: center;
          cursor: pointer; position: relative; overflow: hidden;
          transition: border-color .4s, background .4s;
          backdrop-filter: blur(20px);
        }
        .upload-zone:hover { border-color: rgba(255,255,255,.28); background: rgba(255,255,255,.04); }
        .upload-zone:hover .upload-icon-wrap { transform: translateY(-4px); }
        
        .upload-zone.dragging { border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.1); }

        .upload-icon-wrap {
          width: 52px; height: 52px; margin: 0 auto 18px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1);
          transition: transform .4s cubic-bezier(.34,1.56,.64,1);
        }
        .upload-title { font-family: 'Cinzel', serif; font-size: 13px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.8); margin-bottom: 8px; }
        .upload-sub { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); }

        /* corner accents */
        .upload-zone::before, .upload-zone::after { content: ''; position: absolute; width: 16px; height: 16px; border-color: rgba(255,255,255,.2); border-style: solid; transition: border-color .4s; }
        .upload-zone::before { top: 10px; left: 10px; border-width: 1px 0 0 1px; }
        .upload-zone::after  { bottom: 10px; right: 10px; border-width: 0 1px 1px 0; }
        .upload-zone:hover::before, .upload-zone:hover::after { border-color: rgba(255,255,255,.4); }

        /* ── GRID (docs + chats) ── */
        .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; animation: fadeUp .7s ease .65s both; }

        .panel {
          background: var(--panel); border: 1px solid var(--border);
          border-radius: 2px; overflow: hidden;
          backdrop-filter: blur(20px);
          position: relative;
          display: flex; flex-direction: column;
        }
        .panel::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.1), transparent); }
        .panel-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid var(--border);
        }
        .panel-title { font-family: 'Cinzel', serif; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,.75); display: flex; align-items: center; gap: 10px; }
        .panel-count { font-size: 9px; letter-spacing: 2px; color: var(--muted); }

        .empty-state { padding: 44px 22px; text-align: center; }
        .empty-icon { width: 36px; height: 36px; margin: 0 auto 14px; opacity: .18; }
        .empty-text { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,.2); line-height: 1.8; }

        /* ── BUTTON ── */
        .btn-row { margin-top: 32px; display: flex; gap: 16px; animation: fadeUp .7s ease .75s both; }
        button.arrow-btn {
          position: relative; display: inline-block; cursor: pointer;
          outline: none; border: 0; vertical-align: middle;
          background: transparent; padding: 0; font-size: inherit; font-family: inherit;
          width: 220px; height: 48px;
        }
        button.arrow-btn .circle {
          transition: all .45s cubic-bezier(.65,0,.076,1);
          position: absolute; right: 0; top: 0; bottom: 0; margin: auto;
          display: block; width: 48px; height: 48px;
          background: #fff; border-radius: 24px;
        }
        button.arrow-btn .icon { transition: all .45s cubic-bezier(.65,0,.076,1); position: absolute; top: 0; bottom: 0; margin: auto; }
        button.arrow-btn .icon.arrow { right: 13px; left: auto; width: 18px; height: 2px; background: none; }
        button.arrow-btn .icon.arrow::before {
          position: absolute; content: '';
          top: -5px; right: 1px; width: 10px; height: 10px;
          border-top: 2px solid #111; border-right: 2px solid #111; transform: rotate(45deg);
        }
        button.arrow-btn .button-text {
          transition: all .45s cubic-bezier(.65,0,.076,1);
          position: absolute; top: 0; left: 0; right: 48px; bottom: 0;
          padding: 0 0 0 18px; display: flex; align-items: center;
          color: #fff;
          font-family: 'Orbitron', monospace; font-weight: 700; font-size: 9px; letter-spacing: 3px; text-transform: uppercase;
          background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
          border-radius: 2px 0 0 2px;
        }
        button.arrow-btn:hover .circle { width: 100%; border-radius: 2px; }
        button.arrow-btn:hover .icon.arrow { background: #111; transform: translate(-6px,0); }
        button.arrow-btn:hover .button-text { color: #111; background: transparent; border-color: transparent; }

        @media (max-width: 768px) {
          .stats { grid-template-columns: 1fr; }
          .content-grid { grid-template-columns: 1fr; }
        }
      `}} />

      {/* TOPBAR */}
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Your intelligence command centre</div>
        </div>
        <div className="topbar-actions">
          <div className="icon-btn" title="Settings">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="user-chip">
            <div className="chip-avatar">{initial}</div>
            <span className="chip-name">{firstName}</span>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Documents</div>
          <div className="stat-value">{loadingData ? "--" : documents.length.toString().padStart(2, '0')}</div>
          <div className="stat-desc">Files uploaded to your arsenal</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Chats</div>
          <div className="stat-value">{loadingData ? "--" : chats.length.toString().padStart(2, '0')}</div>
          <div className="stat-desc">Conversations with encrypted intelligence</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Study Streak</div>
          <div className="stat-value">01</div>
          <div className="stat-desc">Day one. Begin.</div>
        </div>
      </div>

      {/* UPLOAD */}
      <div className="upload-section">
        <div className="section-header">
          <span className="section-title">Upload Document</span>
          <span className="section-count">PDF · Max 20MB · 100 pages</span>
        </div>
        <div 
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="upload-icon-wrap">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
            </svg>
          </div>
          <div className="upload-title">Drag &amp; Drop your PDF</div>
          <div className="upload-sub">or click to browse files</div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileSelect} 
          accept=".pdf" 
          style={{ display: "none" }} 
        />
      </div>

      {/* GRID */}
      <div className="content-grid" id="files">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .6 }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Your Documents
            </span>
            <span className="panel-count">{documents.length} files</span>
          </div>
          {loadingData ? (
             <div className="p-4 text-center text-xs text-[var(--muted)]">Decrypting...</div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1">
                <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <div className="empty-text">No documents yet<br/>Upload a PDF above to begin</div>
            </div>
          ) : (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[rgba(255,255,255,0.7)]" />
                    <div>
                      <div className="text-[11px] text-white font-medium">{doc.filename}</div>
                      <div className="text-[9px] text-[rgba(255,255,255,0.4)] mt-1">{doc.page_count} pages • {doc.chunk_count} chunks</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 rounded hover:bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)] hover:text-red-400 transition-colors">
                      <Trash2 size={14}/>
                    </button>
                    <button onClick={() => handleNewChat(doc.id)} className="p-1.5 rounded bg-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.15)] transition-colors">
                      <MessageSquare size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel" id="chats">
          <div className="panel-head">
            <span className="panel-title">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" style={{ opacity: .6 }}>
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              Recent Chats
            </span>
            <span className="panel-count">{chats.length} chats</span>
          </div>
          {loadingData ? (
             <div className="p-4 text-center text-xs text-[var(--muted)]">Accessing mainframe...</div>
          ) : chats.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1">
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <div className="empty-text">No conversations yet<br/>Upload a document to start</div>
            </div>
          ) : (
            <div className="flex flex-col max-h-[300px] overflow-y-auto">
              {chats.map((chat) => (
                <div key={chat.id} onClick={() => router.push('/chat/' + chat.id)} className="flex justify-between items-center p-4 border-b border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-[rgba(255,255,255,0.04)] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-[rgba(255,255,255,0.4)] group-hover:text-[rgba(255,255,255,0.9)] transition-colors" />
                    <div>
                      <div className="text-[11px] text-white font-medium truncate max-w-[200px]">{chat.title}</div>
                      <div className="text-[9px] text-[rgba(255,255,255,0.4)] mt-1">{chat.message_count || 0} messages • {formatDate(chat.updated_at)}</div>
                    </div>
                  </div>
                  <div className="text-[9px] text-[rgba(255,255,255,0.3)]">Open →</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="btn-row">
        <button className="arrow-btn" type="button" onClick={() => document.getElementById('fileInput')?.click()}>
          <span className="circle" aria-hidden="true"><span className="icon arrow"></span></span>
          <span className="button-text">Upload File</span>
        </button>
        <button className="arrow-btn" type="button" onClick={() => documents.length > 0 ? handleNewChat(documents[0].id) : alert('Upload a document first!')}>
          <span className="circle" aria-hidden="true"><span class="icon arrow"></span></span>
          <span className="button-text">New Chat</span>
        </button>
      </div>

    </>
  );
}
