"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");

    try {
      await login(data.email, data.password);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-10 flex flex-col items-center">
        <Logo href="/chat" size="md" />
        <h1 className="mt-9 text-2xl font-medium tracking-[-0.02em] text-text-primary">欢迎回来</h1>
        <p className="mt-2 text-sm text-text-tertiary">使用邮箱登录 Lumina</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-xs font-medium text-text-secondary">邮箱</span>
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="border-border-default bg-bg-secondary"
            error={errors.email?.message}
          />
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-medium text-text-secondary">
            <label htmlFor="login-password">密码</label>
            <Link
              href="/forgot-password"
              className="font-normal text-brand-primary transition-colors hover:text-brand-hover"
            >
              忘记密码？
            </Link>
          </div>
          <Input
            id="login-password"
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="输入密码"
            className="border-border-default bg-bg-secondary"
            error={errors.password?.message}
          />
        </div>

        <Button type="submit" className="w-full bg-text-primary text-bg-primary hover:bg-white" size="lg" isLoading={isLoading}>
          登录
        </Button>
      </form>

      <p className="mt-6 text-center text-text-secondary text-sm">
        还没有账号？
        <Link href="/register" className="text-brand-primary hover:text-brand-hover ml-1">
          使用邮箱注册
        </Link>
      </p>
    </div>
  );
}
