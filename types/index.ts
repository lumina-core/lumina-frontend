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

export interface FeaturedExample {
  id: number;
  title: string;
  preview: string | null;
  category: string | null;
  share_token: string;
  message_count: number;
  contributor: string | null;
  created_at: string;
}

export interface FeaturedExamplesResponse {
  categories: string[];
  examples: FeaturedExample[];
}

// 使用示例提交相关类型
export interface ExampleSubmission {
  id: number;
  chat_session_id: number;
  display_name: string;
  status: "pending" | "reviewing" | "approved" | "rejected";
  llm_score: number | null;
  llm_category: string | null;
  llm_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface ExampleSubmissionListResponse {
  total: number;
  items: ExampleSubmission[];
}

export interface SubmitExampleResponse {
  success: boolean;
  message: string;
  submission_id: number | null;
}

// 邀请码相关类型
export interface MyInviteCode {
  code: string;
  use_count: number;
  invite_url: string;
}

export interface InviteStats {
  total_invited: number;
  total_reward_earned: number;
}

export interface Invitee {
  id: number;
  email: string;
  name: string | null;
  reward_earned: number;
  invited_at: string;
}

export interface InviteListResponse {
  invitees: Invitee[];
  total: number;
}
