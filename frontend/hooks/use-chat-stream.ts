/**
 * Batman AI - WebSocket Chat Streaming Hook
 * Gracefully handles missing backend for demo mode.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createChatWs } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources: string[];
}

interface StreamState {
  isStreaming: boolean;
  currentTokens: string;
  currentSources: string[];
}

export function useChatStream(chatId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<StreamState>({ isStreaming: false, currentTokens: "", currentSources: [] });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stream, setStream] = useState<StreamState>({
    isStreaming: false,
    currentTokens: "",
    currentSources: [],
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Connect WebSocket (with graceful failure for demo)
  useEffect(() => {
    if (!chatId) return;

    const token = getToken();
    if (token === "mock-guest-token-abc" || chatId.startsWith("demo-")) {
      setIsDemo(true);
      setConnected(true);
      return;
    }

    try {
      const ws = createChatWs(chatId);
      wsRef.current = ws;

      ws.onopen = () => {
        if (token) {
          ws.send(JSON.stringify({ token }));
          setConnected(true);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case "token":
              streamRef.current = {
                ...streamRef.current,
                isStreaming: true,
                currentTokens: streamRef.current.currentTokens + data.content,
              };
              setStream({ ...streamRef.current });
              break;
            case "sources":
              streamRef.current = { ...streamRef.current, currentSources: data.sources || [] };
              setStream({ ...streamRef.current });
              break;
            case "done":
              if (streamRef.current.currentTokens) {
                const finalMsg: ChatMessage = {
                  role: "assistant",
                  content: streamRef.current.currentTokens,
                  sources: streamRef.current.currentSources,
                };
                setMessages((msgs) => [...msgs, finalMsg]);
              }
              streamRef.current = { isStreaming: false, currentTokens: "", currentSources: [] };
              setStream({ ...streamRef.current });
              break;
            case "error":
              setError(data.content);
              streamRef.current = { isStreaming: false, currentTokens: "", currentSources: [] };
              setStream({ ...streamRef.current });
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onerror = () => {
        setIsDemo(true);
        setConnected(true);
        setError(null);
      };
      ws.onclose = () => setConnected(false);

      return () => {
        ws.close();
        wsRef.current = null;
      };
    } catch {
      // WebSocket creation failed — enter demo mode
      setIsDemo(true);
      setConnected(true);
    }
  }, [chatId]);

  // Send message (with demo fallback)
  const sendMessage = useCallback(
    (content: string, options?: { mode?: 'normal' | 'student'; marks?: number; easyToRemember?: boolean }) => {
      // Add user message
      setMessages((prev) => [...prev, { role: "user", content, sources: [] }]);

      if (isDemo || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Demo mode: simulate a response
        streamRef.current = { isStreaming: true, currentTokens: "", currentSources: [] };
        setStream({ ...streamRef.current });

        const demoResponse = `This is a **demo response** from Batman AI.\n\nIn the full version, this would provide an intelligent answer based on your uploaded document using RAG (Retrieval-Augmented Generation) technology.\n\n**Your question:** "${content}"\n\n> 🦇 *Deploy the backend to enable real AI responses.*`;

        let i = 0;
        const interval = setInterval(() => {
          if (i < demoResponse.length) {
            const chunk = demoResponse.slice(i, i + 3);
            streamRef.current = {
              ...streamRef.current,
              isStreaming: true,
              currentTokens: streamRef.current.currentTokens + chunk,
            };
            setStream({ ...streamRef.current });
            i += 3;
          } else {
            clearInterval(interval);
            const finalMsg: ChatMessage = {
              role: "assistant",
              content: demoResponse,
              sources: [],
            };
            setMessages((msgs) => [...msgs, finalMsg]);
            streamRef.current = { isStreaming: false, currentTokens: "", currentSources: [] };
            setStream({ ...streamRef.current });
          }
        }, 20);
        return;
      }

      streamRef.current = { isStreaming: true, currentTokens: "", currentSources: [] };
      setStream({ ...streamRef.current });

      const payload = {
        content,
        mode: options?.mode || 'normal',
        marks: options?.marks || null,
        easy_to_remember: options?.easyToRemember || false,
      };
      wsRef.current.send(JSON.stringify(payload));
    },
    [isDemo]
  );

  // Load existing messages
  const loadMessages = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
  }, []);

  return {
    messages,
    stream,
    connected,
    error,
    sendMessage,
    loadMessages,
    isDemo,
  };
}
