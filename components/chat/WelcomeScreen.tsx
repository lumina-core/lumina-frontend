"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { PromptSignalStrip } from "@/components/chat/PromptSignalStrip";

interface WelcomeScreenProps {
  onSend: (prompt: string) => void;
  isStreaming?: boolean;
  disabled?: boolean;
  inputNotice?: ReactNode;
}

export function WelcomeScreen({
  onSend,
  isStreaming,
  disabled,
  inputNotice,
}: WelcomeScreenProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-[12vh] pt-10 sm:px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-[46%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/[0.055] blur-[100px]"
        aria-hidden="true"
      />

      <motion.div
        className="relative w-full max-w-[720px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-balance text-[32px] font-medium tracking-[-0.035em] text-text-primary sm:text-[42px]">
            读懂新闻联播里的信号
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-tertiary sm:text-[15px]">
            追踪新闻联播数据的信号趋势，核验原文、比较措辞与观察变化
          </p>
        </div>

        <ChatInput
          onSend={onSend}
          disabled={disabled}
          isStreaming={isStreaming}
          variant="hero"
          autoFocus
        />

        <PromptSignalStrip onSelect={onSend} disabled={disabled || isStreaming} />

        {inputNotice}

        <p className="mt-3 text-center text-[11px] tracking-wide text-[#4e5159]">
          回答附原文依据 · 重要决策请交叉核验
        </p>
      </motion.div>
    </div>
  );
}
