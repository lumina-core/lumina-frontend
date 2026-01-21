import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lumina - AI 新闻分析助手",
    template: "%s | Lumina",
  },
  description: "专业的 AI 新闻分析助手，帮助投资者、研究员、企业决策者从海量新闻中快速获取洞察。",
  keywords: ["AI", "新闻分析", "投资", "研究", "智能助手", "Lumina"],
  authors: [{ name: "Lumina Team" }],
  creator: "Lumina",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Lumina",
    title: "Lumina - AI 新闻分析助手",
    description: "专业的 AI 新闻分析助手，帮助投资者、研究员、企业决策者从海量新闻中快速获取洞察。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - AI 新闻分析助手",
    description: "专业的 AI 新闻分析助手，帮助投资者、研究员、企业决策者从海量新闻中快速获取洞察。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
