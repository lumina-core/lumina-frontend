"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import {
  MessageSquarePlus,
  Settings,
  LogOut,
  Coins,
  Menu,
  X,
  User,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, credits, logout } = useAuthStore();
  const { clearMessages } = useChatStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleNewChat = () => {
    clearMessages();
    router.push("/chat");
    setIsMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border-default">
        <Logo />
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant="secondary"
        >
          <MessageSquarePlus className="w-5 h-5" />
          新对话
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <Link href="/" onClick={() => setIsMobileOpen(false)}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-text-secondary hover:text-text-primary"
          >
            <Home className="w-4 h-4" />
            首页
          </Button>
        </Link>
        {/* Future: Chat history list */}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border-default space-y-2">
        {/* Credits Display */}
        {credits && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary">
            <Coins className="w-4 h-4 text-warning" />
            <span className="text-sm text-text-secondary">积分余额</span>
            <span className="ml-auto text-sm font-medium text-text-primary">
              {credits.credits.toLocaleString()}
            </span>
          </div>
        )}

        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name || "用户"}
            </p>
            <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link href="/settings" className="flex-1" onClick={() => setIsMobileOpen(false)}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                pathname === "/settings" && "bg-bg-tertiary"
              )}
            >
              <Settings className="w-4 h-4" />
              设置
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="px-3">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-bg-secondary border border-border-default"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col w-64 bg-bg-secondary border-r border-border-default h-screen",
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-bg-secondary border-r border-border-default",
          "transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1"
        >
          <X className="w-5 h-5 text-text-tertiary" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
