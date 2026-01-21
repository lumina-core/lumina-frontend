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
  credits: number;
  daily_used: number;
  daily_limit: number;
  daily_remaining: number;
  can_use: boolean;
  last_checkin_date: string | null;
  checked_in_today: boolean;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  credits_earned: number;
  current_credits: number;
  streak_days: number;
}

export type MessagePart =
  | { type: "text"; content: string }
  | { type: "tool_call"; toolCall: ToolCall };

export interface Message {
  role: "user" | "assistant";
  parts: MessagePart[];
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  output?: string;
  status: "pending" | "running" | "completed";
}

export interface AggregatedToolCall {
  name: string;
  count: number;
  completedCount: number;
  status: "running" | "completed";
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

export interface ChatSession {
  id: number;
  title: string;
  preview: string | null;
  message_count: number;
  starred: boolean;
  is_public: boolean;
  share_token: string | null;
  share_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShareResponse {
  success: boolean;
  share_token: string;
  share_url: string;
  message: string;
}

export interface SharedSession {
  id: number;
  title: string;
  created_at: string;
  messages: ChatHistoryMessage[];
}

export interface ChatHistoryMessage {
  id: number;
  session_id: number;
  role: "user" | "assistant";
  content: string;
  tool_calls: string | null;
  created_at: string;
}

export interface ChatSessionListResponse {
  total: number;
  items: ChatSession[];
}

export interface ChatMessageListResponse {
  total: number;
  items: ChatHistoryMessage[];
}
