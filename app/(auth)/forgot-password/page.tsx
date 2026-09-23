"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const emailSchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
});

const resetSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "请输入 6 位数字验证码"),
    password: z.string().min(8, "密码至少 8 位"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码不一致",
    path: ["confirmPassword"],
  });

type EmailForm = z.infer<typeof emailSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });
  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const sendResetCode = async (targetEmail: string) => {
    setIsLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await api.forgotPassword(targetEmail);
      setEmail(targetEmail);
      setStep(2);
      setNotice(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "验证码发送失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (data: EmailForm) => {
    await sendResetCode(data.email);
  };

  const handleResetSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    setError("");
    setNotice("");
    let passwordWasReset = false;
    try {
      await api.resetPassword(email, data.code, data.password);
      passwordWasReset = true;
      await login(email, data.password);
      router.replace("/chat");
    } catch (err) {
      setError(
        passwordWasReset
          ? "密码已经重置，但自动登录失败。请返回登录页，使用新密码登录。"
          : err instanceof Error
          ? err.message
          : "密码重置失败，请检查验证码后重试",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "border-border-default bg-bg-secondary";

  return (
    <div>
      <div className="mb-8 flex flex-col items-center">
        <Logo href="/login" size="md" />
        <h1 className="mt-8 text-2xl font-medium tracking-[-0.02em] text-text-primary">
          重置密码
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-text-tertiary">
          {step === 1
            ? "输入注册邮箱，我们会发送验证码"
            : "验证身份并设置新密码，完成后自动登录"}
        </p>
      </div>

      <div className="mb-7 flex items-center gap-2" aria-label={`重置密码步骤 ${step} / 2`}>
        {[1, 2].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              item <= step ? "bg-brand-primary" : "bg-white/[0.08]",
            )}
          />
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-success/20 bg-success/10 p-3 text-sm leading-6 text-success"
        >
          {notice}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">
              注册邮箱
            </span>
            <Input
              {...emailForm.register("email")}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              className={inputClassName}
              error={emailForm.formState.errors.email?.message}
            />
          </label>

          <Button
            type="submit"
            className="w-full bg-text-primary text-bg-primary hover:bg-white"
            size="lg"
            isLoading={isLoading}
          >
            发送验证码
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-5">
          <p className="text-center text-sm leading-6 text-text-tertiary">
            验证码已发送至<br />
            <span className="text-text-primary">{email}</span>
          </p>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">
              邮箱验证码
            </span>
            <Input
              {...resetForm.register("code")}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              placeholder="6 位验证码"
              maxLength={6}
              className={`${inputClassName} text-center font-mono tracking-[0.32em]`}
              error={resetForm.formState.errors.code?.message}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">
              新密码
            </span>
            <Input
              {...resetForm.register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="至少 8 位"
              className={inputClassName}
              error={resetForm.formState.errors.password?.message}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">
              确认新密码
            </span>
            <Input
              {...resetForm.register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="再次输入新密码"
              className={inputClassName}
              error={resetForm.formState.errors.confirmPassword?.message}
            />
          </label>

          <Button
            type="submit"
            className="w-full bg-text-primary text-bg-primary hover:bg-white"
            size="lg"
            isLoading={isLoading}
          >
            重置密码并登录
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setNotice("");
                setError("");
              }}
              className="text-text-tertiary transition-colors hover:text-text-secondary"
            >
              修改邮箱
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => sendResetCode(email)}
              className="text-brand-primary transition-colors hover:text-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              重新发送验证码
            </button>
          </div>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-text-secondary">
        想起密码了？
        <Link href="/login" className="ml-1 text-brand-primary hover:text-brand-hover">
          返回登录
        </Link>
      </p>
    </div>
  );
}
