"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, MessageCircle, X } from "lucide-react";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [showQrCode, setShowQrCode] = useState(false);

  return (
    <>
      <footer className={`border-t border-border-default bg-bg-secondary py-4 px-6 ${className}`}>
        <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
          <span>联系我：</span>
          <a
            href="mailto:lumina_dev@163.com"
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <Mail className="w-4 h-4" />
            邮箱
          </a>
          <button
            onClick={() => setShowQrCode(true)}
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            QQ
          </button>
        </div>
      </footer>

      {/* QR Code Modal */}
      {showQrCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="relative bg-bg-secondary rounded-xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrCode(false)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>
            <div className="text-center">
              <p className="text-text-primary font-medium mb-4">扫描二维码添加 QQ</p>
              <Image
                src="/images/qrcode-qq.JPG"
                alt="QQ 二维码"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
