export interface User {
  id: number;
  email: string;
  name: string;
  is_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface UserCredits {
  user_id: number;
  email: string;
  invite_code: string;
  credits: number;
  is_active: boolean;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed";
}

export interface ChatUsage {
  input_tokens: number;
  output_tokens: number;
  credits_deducted: number;
  credits_remaining: number;
}

export type SSEEventType = "token" | "tool_start" | "tool_end" | "usage" | "done" | "error";

export interface SSEEvent {
  type: SSEEventType;
  content?: string;
  name?: string;
  input?: Record<string, unknown>;
  output?: string;
  input_tokens?: number;
  output_tokens?: number;
  credits_deducted?: number;
  credits_remaining?: number;
  error?: string;
}

export interface PromptExample {
  category: string;
  prompts: string[];
}
