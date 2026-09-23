"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Logo } from "@/components/Logo";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const step1Schema = z.object({
  invite_code: z.string().optional(),
  email: z.email("请输入有效的邮箱地址"),
});

const step2Schema = z.object({
  code: z.string().length(6, "验证码为6位数字"),
});

const step3Schema = z.object({
  name: z.string().min(1, "请输入昵称"),
  password: z.string().min(8, "密码至少8位"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次密码不一致",
  path: ["confirmPassword"],
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;
type Step3Form = z.infer<typeof step3Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    invite_code: "",
    email: "",
    code: "",
  });

  const step1Form = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
  });

  const step2Form = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
  });

  const step3Form = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
  });

  const handleStep1 = async (data: Step1Form) => {
    setIsLoading(true);
    setError("");

    try {
      await api.sendCode(data.email, data.invite_code);
      setFormData((prev) => ({ ...prev, ...data }));
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送验证码失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = async (data: Step2Form) => {
    setFormData((prev) => ({ ...prev, code: data.code }));
    setStep(3);
  };

  const handleStep3 = async (data: Step3Form) => {
    setIsLoading(true);
    setError("");

    try {
      const res = await api.register({
        email: formData.email,
        code: formData.code,
        password: data.password,
        name: data.name,
        invite_code: formData.invite_code,
      });
      setUser(res.user);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "border-border-default bg-bg-secondary";

  return (
    <div>
      <div className="mb-8 flex flex-col items-center">
        <Logo href="/chat" size="md" />
        <h1 className="mt-8 text-2xl font-medium tracking-[-0.02em] text-text-primary">创建账号</h1>
        <p className="mt-2 text-sm text-text-tertiary">使用邮箱注册，完成后即可获得积分</p>
      </div>

      <div className="mb-7 flex items-center gap-2" aria-label={`注册步骤 ${step} / 3`}>
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              item <= step ? "bg-brand-primary" : "bg-white/[0.08]"
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">邮箱</span>
            <Input
              {...step1Form.register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClassName}
              error={step1Form.formState.errors.email?.message}
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              邀请码 <span className="font-normal text-text-tertiary">可选</span>
            </span>
            <Input
              {...step1Form.register("invite_code")}
              placeholder="有邀请码可获得额外积分"
              className={inputClassName}
            />
          </label>

          <Button type="submit" className="w-full bg-text-primary text-bg-primary hover:bg-white" size="lg" isLoading={isLoading}>
            发送邮箱验证码
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-5">
          <p className="text-center text-sm leading-6 text-text-tertiary">
            验证码已发送至<br />
            <span className="text-text-primary">{formData.email}</span>
          </p>
          <Input
            {...step2Form.register("code")}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6 位验证码"
            maxLength={6}
            className={`${inputClassName} text-center font-mono tracking-[0.32em]`}
            error={step2Form.formState.errors.code?.message}
          />
          <Button type="submit" className="w-full bg-text-primary text-bg-primary hover:bg-white" size="lg">
            下一步
          </Button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-sm text-text-tertiary transition-colors hover:text-text-secondary"
          >
            返回修改邮箱
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">昵称</span>
            <Input
              {...step3Form.register("name")}
              autoComplete="name"
              placeholder="怎么称呼你"
              className={inputClassName}
              error={step3Form.formState.errors.name?.message}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">密码</span>
            <Input
              {...step3Form.register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="至少 8 位"
              className={inputClassName}
              error={step3Form.formState.errors.password?.message}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-medium text-text-secondary">确认密码</span>
            <Input
              {...step3Form.register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="再次输入密码"
              className={inputClassName}
              error={step3Form.formState.errors.confirmPassword?.message}
            />
          </label>
          <Button type="submit" className="w-full bg-text-primary text-bg-primary hover:bg-white" size="lg" isLoading={isLoading}>
            完成注册
          </Button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-center text-sm text-text-tertiary transition-colors hover:text-text-secondary"
          >
            返回上一步
          </button>
        </form>
      )}

      <p className="mt-7 text-center text-sm text-text-secondary">
        已有账号？
        <Link href="/login" className="ml-1 text-brand-primary hover:text-brand-hover">
          登录
        </Link>
      </p>
    </div>
  );
}
