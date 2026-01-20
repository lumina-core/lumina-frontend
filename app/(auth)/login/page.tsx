"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Logo } from "@/components/Logo";
import { Button, Input, Card } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-text-secondary">AI 新闻分析助手</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <Input
            {...register("email")}
            type="email"
            placeholder="邮箱"
            className="pl-12"
            error={errors.email?.message}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <Input
            {...register("password")}
            type="password"
            placeholder="密码"
            className="pl-12"
            error={errors.password?.message}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          登 录
        </Button>
      </form>

      <p className="mt-6 text-center text-text-secondary text-sm">
        还没有账号？
        <Link href="/register" className="text-brand-primary hover:text-brand-hover ml-1">
          立即注册
        </Link>
      </p>
    </Card>
  );
}
