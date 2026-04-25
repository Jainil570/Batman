/**
 * Batman AI - API Client
 * Fetch wrapper for backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(fetchOpts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail || "Request failed", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ===== Auth =====
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    apiFetch("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: (token: string) =>
    apiFetch("/api/v1/auth/me", { token }),
};

// ===== Documents =====
export const docsApi = {
  upload: (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch("/api/v1/docs/upload", {
      method: "POST",
      body: formData,
      token,
    });
  },
  list: (token: string) =>
    apiFetch("/api/v1/docs/list", { token }),
  delete: (docId: string, token: string) =>
    apiFetch(`/api/v1/docs/${docId}`, {
      method: "DELETE",
      token,
    }),
};

// ===== Chats =====
export const chatApi = {
  create: (data: { document_id: string; title?: string }, token: string) =>
    apiFetch("/api/v1/chat/", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),
  list: (token: string) =>
    apiFetch("/api/v1/chat/list", { token }),
  get: (chatId: string, token: string) =>
    apiFetch(`/api/v1/chat/${chatId}`, { token }),
  delete: (chatId: string, token: string) =>
    apiFetch(`/api/v1/chat/${chatId}`, {
      method: "DELETE",
      token,
    }),
};

// ===== WebSocket =====
export function createChatWs(chatId: string): WebSocket {
  const wsBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
    .replace("http", "ws");
  return new WebSocket(`${wsBase}/api/v1/chat/ws/${chatId}`);
}

export { ApiError };
