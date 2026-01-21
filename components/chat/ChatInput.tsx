"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export function ChatInput({ onSend, disabled, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled || isStreaming) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    onSend(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="请输入您的问题..."
        disabled={disabled}
        rows={1}
        className={cn(
          "w-full resize-none py-4 pl-5 pr-14 bg-bg-tertiary text-text-primary",
          "placeholder:text-text-tertiary rounded-2xl border border-transparent",
          "transition-all duration-200 focus:outline-none focus:border-brand-primary",
          "focus:shadow-[var(--shadow-glow)] disabled:opacity-50"
        )}
      />
      <button
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all duration-200",
          value.trim() && !disabled
            ? "bg-brand-primary text-white hover:bg-brand-hover"
            : "bg-bg-elevated text-text-disabled cursor-not-allowed"
        )}
      >
        {isStreaming ? (
          <Square className="w-5 h-5" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
