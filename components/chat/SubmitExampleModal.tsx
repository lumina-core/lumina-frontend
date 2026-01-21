"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";

interface SubmitExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  sessionTitle: string;
  defaultDisplayName?: string;
}

export function SubmitExampleModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  defaultDisplayName = "",
}: SubmitExampleModalProps) {
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async () => {
    if (!displayName.trim()) return;

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await api.submitExample(sessionId, displayName.trim());
      setResult({
        success: response.success,
        message: response.message,
      });
      if (response.success) {
        setTimeout(() => {
          onClose();
          setResult(null);
          setDisplayName(defaultDisplayName);
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "提交失败，请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setResult(null);
      setDisplayName(defaultDisplayName);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="bg-bg-secondary border border-border-default rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  提交为使用示例
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-1 text-text-tertiary hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    会话标题
                  </label>
                  <p className="text-text-primary bg-bg-tertiary rounded-lg px-3 py-2 text-sm">
                    {sessionTitle}
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">
                    展示名称 <span className="text-text-tertiary">(将显示为贡献者)</span>
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="输入你的昵称或名字"
                    maxLength={50}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="bg-bg-tertiary rounded-lg p-3 text-sm text-text-secondary">
                  <p className="mb-2">提交说明：</p>
                  <ul className="list-disc list-inside space-y-1 text-text-tertiary">
                    <li>提交后系统将自动审核内容质量</li>
                    <li>审核通过后会展示在使用示例页面</li>
                    <li>每日最多提交 3 次</li>
                  </ul>
                </div>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      result.success
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm">{result.message}</span>
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !displayName.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        提交
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
