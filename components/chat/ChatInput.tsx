"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  isStreaming?: boolean;
  variant?: "default" | "hero";
  autoFocus?: boolean;
}

export function ChatInput({
  onSend,
  disabled,
  isStreaming,
  variant = "default",
  autoFocus = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled || isStreaming) return;
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
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你想追踪的政策、行业或公司……"
        disabled={disabled}
        rows={1}
        className={cn(
          "w-full resize-none bg-[#16171a] text-text-primary",
          "placeholder:text-[#666a73] border border-white/[0.09]",
          "transition-[border-color,box-shadow,background-color] duration-200 focus:outline-none",
          "focus:border-brand-primary/60 focus:bg-[#191a1e] focus:shadow-[0_0_0_3px_rgba(124,111,255,0.1)] disabled:opacity-50",
          variant === "hero"
            ? "min-h-28 rounded-[22px] pb-12 pl-5 pr-16 pt-5 text-[15px] leading-6 sm:min-h-32 sm:px-6 sm:pb-14 sm:pr-20 sm:pt-6 sm:text-base"
            : "rounded-2xl py-4 pl-5 pr-14 text-[15px] leading-6"
        )}
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!value.trim() || disabled || isStreaming}
        aria-label={isStreaming ? "正在生成" : "发送消息"}
        className={cn(
          "absolute flex items-center justify-center rounded-xl transition-all duration-200",
          variant === "hero" ? "bottom-4 right-4 h-10 w-10 sm:bottom-5 sm:right-5" : "right-3 top-1/2 h-9 w-9 -translate-y-1/2",
          value.trim() && !disabled && !isStreaming
            ? "bg-[#eeeeef] text-[#111216] hover:bg-white"
            : "cursor-not-allowed bg-white/[0.06] text-text-disabled"
        )}
      >
        {isStreaming ? (
          <Square className="h-4 w-4" />
        ) : (
          <ArrowUp className="h-5 w-5" />
        )}
      </button>
      {variant === "hero" && (
        <span className="pointer-events-none absolute bottom-5 left-5 text-[11px] text-[#555963] sm:bottom-6 sm:left-6">
          Enter 发送 · Shift + Enter 换行
        </span>
      )}
    </div>
  );
}
