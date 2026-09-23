import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lumina - 新闻联播 Agent",
    template: "%s | Lumina",
  },
  description: "追踪新闻联播数据的信号趋势，核验原文、比较措辞与观察变化。",
  keywords: ["AI", "新闻联播", "政策分析", "新闻检索", "Lumina"],
  authors: [{ name: "Lumina Team" }],
  creator: "Lumina",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Lumina",
    title: "Lumina - 新闻联播 Agent",
    description: "从《新闻联播》原始文稿中检索事实、比较措辞与观察趋势。",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - 新闻联播 Agent",
    description: "从《新闻联播》原始文稿中检索事实、比较措辞与观察趋势。",
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
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
