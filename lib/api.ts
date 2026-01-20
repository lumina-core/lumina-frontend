import type { AuthResponse, User, UserCredits, PromptExample } from "@/types";

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
  async sendCode(email: string, invite_code: string) {
    return this.request<{ success: boolean; message: string }>("/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email, invite_code }),
    });
  }

  async register(data: {
    email: string;
    code: string;
    password: string;
    name: string;
    invite_code: string;
  }) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
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

  // News
  async getPromptExamples() {
    return this.request<{ examples: PromptExample[] }>("/news/prompt-examples");
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
