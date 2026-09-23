"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT_PRESETS = [
  "帮我分析《新闻联播》最近一周有哪些热点，重点方向是什么？",
  "梳理近期“一带一路”的报道变化和发展趋势。",
  "最近的外交报道释放了哪些值得关注的信号？",
  "从经济与民生报道中，找出近期政策关注重点。",
  "比较最近一个月高频政策词的变化，并给出原文依据。",
];

type PromptSignalStripProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export function PromptSignalStrip({
  onSelect,
  disabled,
}: PromptSignalStripProps) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % PROMPT_PRESETS.length);
    }, 4_200);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  const activePrompt = PROMPT_PRESETS[activeIndex];

  return (
    <div
      className="mt-4 overflow-hidden rounded-2xl border border-white/[0.065] bg-white/[0.022]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex min-h-[72px] items-stretch">
        <div className="hidden w-28 shrink-0 items-center border-r border-white/[0.055] px-4 text-[11px] font-medium text-text-disabled sm:flex">
          试试这样问
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={activeIndex}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(activePrompt)}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-[72px] w-full items-center gap-3 px-4 text-left text-[13px] leading-5 text-text-secondary transition-colors hover:bg-white/[0.025] hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 sm:text-sm"
            >
              <span className="line-clamp-2 flex-1">{activePrompt}</span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-hover" />
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.045] px-4 py-2 sm:px-5">
        <span className="text-[10px] text-text-disabled sm:hidden">试试这样问</span>
        <div className="ml-auto flex items-center gap-1.5">
          {PROMPT_PRESETS.map((prompt, index) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`查看示例 ${index + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-[width,background-color] duration-200",
                index === activeIndex
                  ? "w-4 bg-brand-primary/80"
                  : "w-1.5 bg-white/[0.13] hover:bg-white/[0.25]",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
