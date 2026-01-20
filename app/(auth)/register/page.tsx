"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Logo } from "@/components/Logo";
import { Button, Input, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { Mail, Lock, User, Ticket, KeyRound } from "lucide-react";

const step1Schema = z.object({
  invite_code: z.string().min(1, "请输入邀请码"),
  email: z.email("请输入有效的邮箱地址"),
});

const step2Schema = z.object({
  code: z.string().length(6, "验证码为6位数字"),
});

const step3Schema = z.object({
  name: z.string().min(1, "请输入昵称"),
  password: z.string().min(6, "密码至少6位"),
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
      setToken(res.access_token);
      setUser(res.user);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center mb-8">
        <Logo size="lg" />
        <p className="mt-2 text-text-secondary">创建账号</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`w-2 h-2 rounded-full transition-colors ${
              s === step ? "bg-brand-primary" : s < step ? "bg-success" : "bg-border-default"
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Invite Code & Email */}
      {step === 1 && (
        <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
          <div className="relative">
            <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step1Form.register("invite_code")}
              placeholder="邀请码"
              className="pl-12"
              error={step1Form.formState.errors.invite_code?.message}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step1Form.register("email")}
              type="email"
              placeholder="邮箱"
              className="pl-12"
              error={step1Form.formState.errors.email?.message}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            发送验证码
          </Button>
        </form>
      )}

      {/* Step 2: Verification Code */}
      {step === 2 && (
        <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
          <p className="text-center text-text-secondary text-sm mb-4">
            验证码已发送至 <span className="text-text-primary">{formData.email}</span>
          </p>

          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step2Form.register("code")}
              placeholder="6位验证码"
              maxLength={6}
              className="pl-12 text-center tracking-widest"
              error={step2Form.formState.errors.code?.message}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            下一步
          </Button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-text-tertiary text-sm hover:text-text-secondary"
          >
            返回上一步
          </button>
        </form>
      )}

      {/* Step 3: Set Password */}
      {step === 3 && (
        <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step3Form.register("name")}
              placeholder="昵称"
              className="pl-12"
              error={step3Form.formState.errors.name?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step3Form.register("password")}
              type="password"
              placeholder="设置密码"
              className="pl-12"
              error={step3Form.formState.errors.password?.message}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
            <Input
              {...step3Form.register("confirmPassword")}
              type="password"
              placeholder="确认密码"
              className="pl-12"
              error={step3Form.formState.errors.confirmPassword?.message}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            完成注册
          </Button>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full text-center text-text-tertiary text-sm hover:text-text-secondary"
          >
            返回上一步
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-text-secondary text-sm">
        已有账号？
        <Link href="/login" className="text-brand-primary hover:text-brand-hover ml-1">
          立即登录
        </Link>
      </p>
    </Card>
  );
}
