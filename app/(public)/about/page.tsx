"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ArrowLeft, Mail, X } from "lucide-react";
import { CONTACT_CHANNELS, type ContactChannel } from "@/constants";

export default function AboutPage() {
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel | null>(null);

  const qrcodeChannels = CONTACT_CHANNELS.filter((c) => c.type === "qrcode");
  const linkChannels = CONTACT_CHANNELS.filter((c) => c.type === "link");

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />

      {/* Content */}
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-8">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-4">关于</h1>
          <p className="text-text-secondary mb-8">
            了解更多关于 Lumina 和我们的故事。
          </p>
          
          {/* Contact Section */}
          <div className="rounded-xl border border-border-default bg-bg-secondary p-8">
            <h2 className="text-xl font-semibold text-text-primary mb-6">联系我</h2>
            
            {/* 二维码预览网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {qrcodeChannels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-bg-tertiary hover:bg-bg-primary transition-colors"
                >
                  {channel.image && (
                    <Image
                      src={channel.image}
                      alt={channel.name}
                      width={80}
                      height={80}
                      className="rounded-lg"
                    />
                  )}
                  <span className="text-xs font-medium text-text-primary">{channel.name}</span>
                </button>
              ))}
            </div>

            {/* 链接类联系方式 */}
            {linkChannels.length > 0 && (
              <div className="flex flex-wrap gap-4 pt-4 border-t border-border-default">
                {linkChannels.map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.value}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-bg-tertiary hover:bg-bg-primary transition-colors"
                  >
                    <Mail className="w-5 h-5 text-brand-primary" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{channel.name}</p>
                      <p className="text-xs text-text-secondary">{channel.value?.replace("mailto:", "")}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox 全屏预览 */}
      {selectedChannel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-pointer animate-in fade-in duration-200"
          onClick={() => setSelectedChannel(null)}
        >
          <button
            onClick={() => setSelectedChannel(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <p className="text-white/90 font-medium text-lg">
              {selectedChannel.description || selectedChannel.name}
            </p>
            {selectedChannel.image && (
              <Image
                src={selectedChannel.image}
                alt={selectedChannel.name}
                width={320}
                height={320}
                className="rounded-xl shadow-2xl"
              />
            )}
            <p className="text-white/50 text-sm">点击任意位置关闭</p>
          </div>
        </div>
      )}
    </div>
  );
}
