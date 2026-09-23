"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const publicPaths = new Set(["/login", "/register", "/pricing"]);

function isPublicPath(pathname: string) {
  return publicPaths.has(pathname) || pathname.startsWith("/share/");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const publicPath = isPublicPath(pathname);
  const { isLoading, isAuthenticated, fetchUser, fetchCredits } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCredits();
    }
  }, [isAuthenticated, fetchCredits]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !publicPath) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, publicPath, router]);

  if (!publicPath && (isLoading || !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
