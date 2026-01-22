"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, MessageCircle, X } from "lucide-react";
import { CONTACT_CHANNELS } from "@/constants";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [showContactModal, setShowContactModal] = useState(false);

  const qrcodeChannels = CONTACT_CHANNELS.filter((c) => c.type === "qrcode");
  const linkChannels = CONTACT_CHANNELS.filter((c) => c.type === "link");

  return (
    <>
      <footer className={`border-t border-border-default bg-bg-secondary py-4 px-6 ${className}`}>
        <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-1.5 hover:text-brand-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            联系我们
          </button>
        </div>
      </footer>

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="relative bg-bg-secondary rounded-xl p-6 shadow-xl max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-tertiary" />
            </button>

            <h3 className="text-text-primary font-medium text-center text-lg mb-6">联系我们</h3>

            {/* 二维码网格 */}
            {qrcodeChannels.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
                {qrcodeChannels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl bg-bg-tertiary/50"
                  >
                    {channel.image && (
                      <Image
                        src={channel.image}
                        alt={channel.name}
                        width={140}
                        height={140}
                        className="rounded-lg"
                      />
                    )}
                    <span className="text-sm font-medium text-text-primary">{channel.name}</span>
                    {channel.description && (
                      <span className="text-xs text-text-tertiary text-center">
                        {channel.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 链接类联系方式 */}
            {linkChannels.length > 0 && (
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-border-default">
                {linkChannels.map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.value}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary"
                  >
                    <Mail className="w-4 h-4" />
                    {channel.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
