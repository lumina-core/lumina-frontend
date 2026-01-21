"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Button, Input, Card } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { User, Lock, Coins, ArrowLeft, Gift, CheckCircle } from "lucide-react";
import Link from "next/link";

const profileSchema = z.object({
  name: z.string().min(1, "请输入昵称"),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, "请输入原密码"),
  new_password: z.string().min(6, "新密码至少6位"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "两次密码不一致",
  path: ["confirm_password"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, credits, setUser, fetchCredits } = useAuthStore();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isCheckinLoading, setIsCheckinLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState("");
  const [error, setError] = useState("");

  const handleCheckin = async () => {
    setIsCheckinLoading(true);
    setCheckinMessage("");
    setError("");

    try {
      const res = await api.checkin();
      setCheckinMessage(res.success ? `签到成功！获得 ${res.credits_earned} 积分` : res.message);
      if (res.success) {
        fetchCredits();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "签到失败");
    } finally {
      setIsCheckinLoading(false);
    }
  };

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || "" },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSubmit = async (data: ProfileForm) => {
    setIsProfileLoading(true);
    setProfileSuccess(false);
    setError("");

    try {
      const updatedUser = await api.updateMe(data.name);
      setUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setIsPasswordLoading(true);
    setPasswordSuccess(false);
    setError("");

    try {
      await api.changePassword(data.old_password, data.new_password);
      passwordForm.reset();
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "修改密码失败");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold">设置</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-error/10 text-error text-sm">
            {error}
          </div>
        )}

        {/* Credits Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Coins className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-medium">积分余额</h2>
              <p className="text-sm text-text-tertiary">
                今日已用: {credits?.daily_used || 0} / {credits?.daily_limit || 100}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-semibold text-warning">
                {credits?.credits?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-text-tertiary">可用积分</p>
            </div>
          </div>

          {/* Checkin Button */}
          <div className="pt-4 border-t border-border-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-brand-primary" />
                <span className="text-sm">每日签到</span>
                {credits?.checked_in_today && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="w-3 h-3" />
                    已签到
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {checkinMessage && (
                  <span className="text-sm text-success">{checkinMessage}</span>
                )}
                <Button
                  size="sm"
                  onClick={handleCheckin}
                  isLoading={isCheckinLoading}
                  disabled={credits?.checked_in_today}
                >
                  {credits?.checked_in_today ? "已签到" : "签到领积分"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Section */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h2 className="font-medium">个人信息</h2>
              <p className="text-sm text-text-tertiary">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div className="mb-4">
              <label className="block text-sm text-text-secondary mb-2">
                昵称
              </label>
              <Input
                {...profileForm.register("name")}
                error={profileForm.formState.errors.name?.message}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" isLoading={isProfileLoading}>
                保存修改
              </Button>
              {profileSuccess && (
                <span className="text-sm text-success">保存成功</span>
              )}
            </div>
          </form>
        </Card>

        {/* Password Section */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-info" />
            </div>
            <div>
              <h2 className="font-medium">修改密码</h2>
              <p className="text-sm text-text-tertiary">定期更换密码以保护账号安全</p>
            </div>
          </div>

          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">
                原密码
              </label>
              <Input
                {...passwordForm.register("old_password")}
                type="password"
                error={passwordForm.formState.errors.old_password?.message}
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                新密码
              </label>
              <Input
                {...passwordForm.register("new_password")}
                type="password"
                error={passwordForm.formState.errors.new_password?.message}
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                确认新密码
              </label>
              <Input
                {...passwordForm.register("confirm_password")}
                type="password"
                error={passwordForm.formState.errors.confirm_password?.message}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" isLoading={isPasswordLoading}>
                修改密码
              </Button>
              {passwordSuccess && (
                <span className="text-sm text-success">修改成功</span>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
