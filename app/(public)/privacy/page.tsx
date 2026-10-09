import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/constants/contact";
export const metadata: Metadata = {
  title: "隐私说明", description: "了解 Lumina 的账户、分析记录与访问统计。",
  alternates: { canonical: "/privacy" }, robots: { index: true, follow: true },
  openGraph: { url: "/privacy", title: "隐私说明 | Lumina" },
};
export default function PrivacyPage() {
  return <main className="mx-auto min-h-screen max-w-2xl px-6 py-12 text-text-primary">
    <Link href="/chat" className="text-sm underline">返回 Lumina</Link>
    <h1 className="mt-8 text-3xl font-medium">隐私说明</h1>
    <div className="mt-8 space-y-7 text-sm leading-7 text-text-secondary">
      <section><h2 className="text-lg text-text-primary">账户与分析记录</h2><p>邮箱用于登录和账户服务。分析问题、回答、历史记录与积分用量由服务端保存，以提供会话恢复及计费功能。登录凭证保存在 HttpOnly 安全 Cookie 中。主动分享后，持有分享链接的人可以阅读对应内容，请勿分享敏感信息。</p></section>
      <section><h2 className="text-lg text-text-primary">访问统计</h2><p>正式网站使用 Vercel Web Analytics 汇总公开页面的访问量、来源、地区及设备信息，不使用广告 Cookie。统计仅允许积分方案和本页；聊天入口、账户、具体会话及分享链接不进入页面统计，网址参数和片段会被移除。我们不向该统计服务发送问题、回答、邮箱、会话编号或分享凭证。</p><p>浏览器启用 Do Not Track 或 Global Privacy Control 时不加载访问统计。本地开发与预览域名也不参与统计。访问统计与提供账户及分析服务所需的服务端记录是不同用途。</p></section>
      <section><h2 className="text-lg text-text-primary">第三方处理与联系</h2><p>网站由 Vercel 托管；分析请求由服务端通过模型供应商处理。不要提交不希望交由这些服务处理的敏感资料。如需咨询或申请处理账户数据，请联系 <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>。</p></section>
    </div>
  </main>;
}
