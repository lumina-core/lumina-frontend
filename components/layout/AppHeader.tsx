"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Clock3,
  Coins,
  LogOut,
  Settings,
  SquarePen,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, credits, isAuthenticated, logout } = useAuthStore();
  const clearMessages = useChatStore((state) => state.clearMessages);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const startNewChat = () => {
    clearMessages();
    router.replace("/chat");
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.replace("/login");
  };

  return (
    <header className="relative z-30 h-14 shrink-0 border-b border-white/[0.06] bg-bg-primary/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-4 sm:px-6">
        <Logo href="/chat" size="sm" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                onClick={startNewChat}
                className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                aria-label="开始新对话"
              >
                <SquarePen className="h-4 w-4" />
                <span className="hidden sm:inline">新对话</span>
              </button>

              <Link
                href="/history"
                className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                aria-label="查看历史记录"
              >
                <Clock3 className="h-4 w-4" />
                <span className="hidden sm:inline">历史</span>
              </Link>

              <Link
                href="/settings"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-text-primary transition-colors hover:border-white/[0.14] hover:bg-white/[0.07]"
                aria-label="查看积分"
              >
                <Coins className="h-3.5 w-3.5 text-brand-hover" />
                <span className="font-mono text-xs tabular-nums">
                  {credits ? credits.credits.toLocaleString() : "—"}
                </span>
                <span className="hidden text-xs text-text-tertiary sm:inline">积分</span>
              </Link>

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="flex h-9 items-center gap-1.5 rounded-lg pl-1 pr-2 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                  aria-expanded={isMenuOpen}
                  aria-label="打开账户菜单"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary/15 text-xs font-semibold text-brand-hover">
                    {(user?.name || user?.email || "L").slice(0, 1).toUpperCase()}
                  </span>
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", isMenuOpen && "rotate-180")}
                  />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/[0.08] bg-[#151619] p-1.5 shadow-2xl shadow-black/40">
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {user?.name || "Lumina 用户"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-text-tertiary">{user?.email}</p>
                    </div>
                    <div className="my-1 h-px bg-white/[0.06]" />
                    <Link
                      href="/settings"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    >
                      <Settings className="h-4 w-4" />
                      账户与积分
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center rounded-lg px-3 text-sm text-text-secondary transition-colors hover:text-text-primary"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center rounded-lg bg-text-primary px-3.5 text-sm font-medium text-bg-primary transition-colors hover:bg-white/85"
              >
                邮箱注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
