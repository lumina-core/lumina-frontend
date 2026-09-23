"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronUp,
  Clock3,
  Coins,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  SquarePen,
  X,
} from "lucide-react";
import { BrandMark, Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

type SidebarPanelProps = {
  collapsed: boolean;
  mobile?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
  onNewChat: () => void;
};

function SidebarPanel({
  collapsed,
  mobile = false,
  onClose,
  onToggle,
  onNewChat,
}: SidebarPanelProps) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, credits, isAuthenticated, logout } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["chatSessions", "sidebar"],
    queryFn: () => api.getChatSessions({ limit: 12 }),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const navigate = () => onClose?.();

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    router.replace("/login");
  };

  const initials = (user?.name || user?.email || "L").slice(0, 1).toUpperCase();
  const sessions = data?.items ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-white/[0.055]",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {collapsed ? (
          <Link href="/chat" aria-label="Lumina 首页" className="text-brand-primary">
            <BrandMark size={24} />
          </Link>
        ) : (
          <Logo href="/chat" size="sm" />
        )}

        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭导航"
            className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          !collapsed && (
            <button
              type="button"
              onClick={onToggle}
              aria-label="收起侧栏"
              className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      <div className={cn("shrink-0", collapsed ? "px-2 py-3" : "px-3 py-4")}>
        <button
          type="button"
          onClick={onNewChat}
          title={collapsed ? "新对话" : undefined}
          className={cn(
            "flex h-10 w-full items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-sm font-medium text-text-primary transition-colors hover:border-white/[0.14] hover:bg-white/[0.065]",
            collapsed ? "justify-center" : "gap-2.5 px-3",
          )}
        >
          <SquarePen className="h-4 w-4 shrink-0 text-brand-hover" />
          {!collapsed && <span>新对话</span>}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        <Link
          href="/history"
          onClick={navigate}
          title={collapsed ? "全部历史" : undefined}
          className={cn(
            "flex h-9 items-center rounded-lg text-sm transition-colors",
            collapsed ? "justify-center" : "gap-2.5 px-2.5",
            pathname === "/history"
              ? "bg-white/[0.07] text-text-primary"
              : "text-text-secondary hover:bg-white/[0.045] hover:text-text-primary",
          )}
        >
          <Clock3 className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span>全部历史</span>
              <span className="ml-auto text-xs tabular-nums text-text-disabled">
                {data?.total ?? ""}
              </span>
            </>
          )}
        </Link>

        {!collapsed && (
          <div className="mt-5">
            <p className="px-2.5 text-[11px] font-medium text-text-disabled">
              最近对话
            </p>
            <div className="mt-2 space-y-0.5">
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  const href = `/chat/${session.id}`;
                  return (
                    <Link
                      key={session.id}
                      href={href}
                      onClick={navigate}
                      className={cn(
                        "block truncate rounded-lg px-2.5 py-2 text-[13px] leading-5 transition-colors",
                        pathname === href
                          ? "bg-white/[0.065] text-text-primary"
                          : "text-text-tertiary hover:bg-white/[0.04] hover:text-text-secondary",
                      )}
                    >
                      {session.title}
                    </Link>
                  );
                })
              ) : (
                <p className="px-2.5 py-2 text-xs leading-5 text-text-disabled">
                  新对话会出现在这里
                </p>
              )}
            </div>
          </div>
        )}
      </nav>

      <div ref={menuRef} className="relative shrink-0 border-t border-white/[0.055] p-2">
        {profileOpen && (
          <div
            className={cn(
              "absolute bottom-[calc(100%+8px)] z-50 w-60 rounded-2xl border border-white/[0.09] bg-[#17181c] p-2 shadow-2xl shadow-black/45",
              collapsed ? "left-2" : "left-3",
            )}
          >
            <div className="px-2.5 pb-2 pt-1.5">
              <p className="truncate text-sm font-medium text-text-primary">
                {user?.name || "Lumina 用户"}
              </p>
              <p className="mt-0.5 truncate text-xs text-text-tertiary">{user?.email}</p>
            </div>
            <Link
              href="/settings"
              onClick={() => {
                setProfileOpen(false);
                navigate();
              }}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.055] hover:text-text-primary"
            >
              <Coins className="h-4 w-4 text-brand-hover" />
              <span>积分余额</span>
              <span className="ml-auto font-mono text-xs tabular-nums text-text-primary">
                {credits?.credits.toLocaleString() ?? "—"}
              </span>
            </Link>
            <Link
              href="/settings"
              onClick={() => {
                setProfileOpen(false);
                navigate();
              }}
              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.055] hover:text-text-primary"
            >
              <Settings className="h-4 w-4" />
              个人设置
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.055] hover:text-text-primary"
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
          title={collapsed ? user?.name || "账户" : undefined}
          className={cn(
            "flex h-11 w-full items-center rounded-xl text-left transition-colors hover:bg-white/[0.05]",
            collapsed ? "justify-center" : "gap-2.5 px-2",
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/15 text-xs font-semibold text-brand-hover">
            {initials}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text-primary">
                  {user?.name || user?.email?.split("@")[0] || "Lumina 用户"}
                </span>
                <span className="block truncate text-[11px] text-text-tertiary">
                  {credits ? `${credits.credits.toLocaleString()} 积分` : "查看账户"}
                </span>
              </span>
              <ChevronUp
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-text-disabled transition-transform",
                  profileOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>
      </div>

      {!mobile && collapsed && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="展开侧栏"
          className="absolute left-[76px] top-4 z-30 rounded-lg border border-white/[0.08] bg-bg-secondary p-2 text-text-tertiary shadow-lg shadow-black/20 transition-colors hover:text-text-primary"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Sidebar() {
  const router = useRouter();
  const clearMessages = useChatStore((state) => state.clearMessages);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNewChat = () => {
    clearMessages();
    router.replace("/chat");
    setMobileOpen(false);
  };

  return (
    <>
      <aside
        className={cn(
          "relative hidden h-dvh shrink-0 border-r border-white/[0.055] bg-[#111216] transition-[width] duration-200 lg:block",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        <SidebarPanel
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
          onNewChat={handleNewChat}
        />
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-white/[0.055] bg-bg-primary/90 px-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="打开导航"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/[0.05] hover:text-text-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo href="/chat" size="sm" className="ml-2" />
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="关闭导航"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[286px] border-r border-white/[0.07] bg-[#111216] shadow-2xl shadow-black/50 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarPanel
          collapsed={false}
          mobile
          onClose={() => setMobileOpen(false)}
          onNewChat={handleNewChat}
        />
      </aside>
    </>
  );
}
