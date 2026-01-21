"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { User, Settings, LogOut, MessageSquare, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/examples", label: "使用示例" },
  { href: "/pricing", label: "产品套餐" },
  { href: "/docs", label: "文档" },
  { href: "/changelog", label: "更新日志" },
  { href: "/about", label: "关于" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className="border-b border-border-default bg-bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors",
                  pathname === link.href
                    ? "text-text-primary font-medium"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-brand-primary" />
                </div>
                <span className="text-sm font-medium text-text-primary hidden sm:block">
                  {user?.name || "用户"}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-text-tertiary transition-transform",
                  isDropdownOpen && "rotate-180"
                )} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-bg-secondary border border-border-default rounded-lg shadow-lg">
                  <div className="px-4 py-2 border-b border-border-default">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user?.name || "用户"}
                    </p>
                    <p className="text-xs text-text-tertiary truncate">
                      {user?.email}
                    </p>
                  </div>
                  
                  <Link
                    href="/chat"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    进入应用
                  </Link>
                  
                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    个人设置
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link href="/register">
                <Button>免费注册</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
