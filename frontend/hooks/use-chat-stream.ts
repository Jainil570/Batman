/**
 * Batman AI - WebSocket Chat Streaming Hook
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

  // Connect WebSocket
  useEffect(() => {
    if (!chatId) return;

    const ws = createChatWs(chatId);
    wsRef.current = ws;

    ws.onopen = () => {
      const token = getToken();
      if (token) {
        ws.send(JSON.stringify({ token }));
        setConnected(true);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "token":
          streamRef.current = {
            ...streamRef.current,
            isStreaming: true,
            currentTokens: streamRef.current.currentTokens + data.content,
          };
          setStream(streamRef.current);
          break;
        case "sources":
          streamRef.current = {
            ...streamRef.current,
            currentSources: data.sources || [],
          };
          setStream(streamRef.current);
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
          setStream(streamRef.current);
          break;
        case "error":
          setError(data.content);
          streamRef.current = { isStreaming: false, currentTokens: "", currentSources: [] };
          setStream(streamRef.current);
          break;
      }
    };

    ws.onerror = () => setError("WebSocket connection error");
    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [chatId]);

  // Send message
  const sendMessage = useCallback(
    (content: string, options?: { mode?: 'normal' | 'student'; marks?: number; easyToRemember?: boolean }) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      // Add user message optimistically
      setMessages((prev) => [...prev, { role: "user", content, sources: [] }]);
      
      streamRef.current = { isStreaming: true, currentTokens: "", currentSources: [] };
      setStream(streamRef.current);

      const payload = {
        content,
        mode: options?.mode || 'normal',
        marks: options?.marks || null,
        easy_to_remember: options?.easyToRemember || false,
      };

      wsRef.current.send(JSON.stringify(payload));
    },
    []
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
  };
}
