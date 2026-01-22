import type { AuthResponse, User, UserCredits, PromptExample, ChatSession, ChatSessionListResponse, ChatMessageListResponse, CheckinResponse, ShareResponse, SharedSession, FeaturedExamplesResponse, ExampleSubmissionListResponse, SubmitExampleResponse, MyInviteCode, InviteStats, InviteListResponse } from "@/types";

const API_BASE = "/api/v1";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
      }
      const error = await res.json().catch(() => ({ detail: "请求失败" }));
      throw new Error(error.detail || "请求失败");
    }

    return res.json();
  }

  // Auth
  async sendCode(email: string, invite_code?: string) {
    return this.request<{ success: boolean; message: string }>("/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email, invite_code: invite_code || null }),
    });
  }

  async register(data: {
    email: string;
    code: string;
    password: string;
    name: string;
    invite_code?: string;
  }) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ ...data, invite_code: data.invite_code || null }),
    });
  }

  async login(email: string, password: string) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<User>("/auth/me");
  }

  async updateMe(name: string) {
    return this.request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  async changePassword(old_password: string, new_password: string) {
    return this.request<{ success: boolean }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ old_password, new_password }),
    });
  }

  async getCredits() {
    return this.request<UserCredits>("/auth/me/credits");
  }

  async checkin() {
    return this.request<CheckinResponse>("/auth/me/checkin", {
      method: "POST",
    });
  }

  // Invite
  async getMyInviteCode() {
    return this.request<MyInviteCode>("/auth/me/invite-code");
  }

  async getInviteStats() {
    return this.request<InviteStats>("/auth/me/invite-stats");
  }

  async getInvitees(limit = 20, offset = 0) {
    return this.request<InviteListResponse>(`/auth/me/invitees?limit=${limit}&offset=${offset}`);
  }

  // News
  async getPromptExamples() {
    return this.request<{ examples: PromptExample[] }>("/news/prompt-examples");
  }

  // History
  async getChatSessions(params?: { starred?: boolean; search?: string; limit?: number; offset?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.starred) searchParams.set("starred", "true");
    if (params?.search) searchParams.set("search", params.search);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    const query = searchParams.toString();
    return this.request<ChatSessionListResponse>(`/history${query ? `?${query}` : ""}`);
  }

  async createChatSession(title: string, preview?: string) {
    return this.request<ChatSession>("/history", {
      method: "POST",
      body: JSON.stringify({ title, preview }),
    });
  }

  async getChatSession(sessionId: number) {
    return this.request<ChatSession>(`/history/${sessionId}`);
  }

  async updateChatSession(sessionId: number, data: { title?: string; starred?: boolean }) {
    return this.request<ChatSession>(`/history/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteChatSession(sessionId: number) {
    return this.request<{ success: boolean }>(`/history/${sessionId}`, {
      method: "DELETE",
    });
  }

  async getChatMessages(sessionId: number) {
    return this.request<ChatMessageListResponse>(`/history/${sessionId}/messages`);
  }

  async addChatMessage(sessionId: number, role: string, content: string, toolCalls?: string) {
    return this.request<ChatMessageListResponse>(`/history/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ role, content, tool_calls: toolCalls }),
    });
  }

  // Share
  async shareSession(sessionId: number) {
    return this.request<ShareResponse>(`/history/${sessionId}/share`, {
      method: "POST",
    });
  }

  async unshareSession(sessionId: number) {
    return this.request<{ success: boolean }>(`/history/${sessionId}/share`, {
      method: "DELETE",
    });
  }

  async getSharedSession(shareToken: string) {
    return this.request<SharedSession>(`/history/shared/${shareToken}`);
  }

  // Examples
  async getFeaturedExamples(category?: string) {
    const params = category ? `?category=${encodeURIComponent(category)}` : "";
    return this.request<FeaturedExamplesResponse>(`/examples${params}`);
  }

  async submitExample(chatSessionId: number, displayName: string) {
    return this.request<SubmitExampleResponse>("/examples/submit", {
      method: "POST",
      body: JSON.stringify({ chat_session_id: chatSessionId, display_name: displayName }),
    });
  }

  async getMySubmissions(status?: string) {
    const params = status ? `?status=${encodeURIComponent(status)}` : "";
    return this.request<ExampleSubmissionListResponse>(`/examples/submissions${params}`);
  }

  // Chat Stream (uses dedicated API route to avoid buffering)
  async *chatStream(query: string, chat_history: { role: string; content: string }[]) {
    const token = this.getToken();
    const res = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ query, chat_history }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      const error = await res.json().catch(() => ({ detail: "请求失败" }));
      throw new Error(error.detail || "请求失败");
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("无法读取响应流");
    }

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6));
            yield event;
          } catch {
            // ignore parse errors
          }
        }
      }
    }
  }
}

export const api = new ApiClient();
