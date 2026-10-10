import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CONTACT_EMAIL } from "@/constants/contact";

const title = "新闻联播检索与分析 | Lumina";
const description = "检索《新闻联播》中文文稿，比较报道频次与措辞，回到原文核验。Search CCTV’s Xinwen Lianbo archive and check coverage against the source.";

export const metadata: Metadata = {
  title: "新闻联播检索与分析",
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "Lumina",
    title,
    description,
    url: "/",
  },
  twitter: { card: "summary", title, description },
};

const questions = [
  {
    zh: "2024 年的《新闻联播》怎样报道低空经济？",
    en: "How did Xinwen Lianbo cover the low-altitude economy in 2024?",
  },
  {
    zh: "“新质生产力”的相关报道，按月看有什么变化？",
    en: "How did coverage of “new quality productive forces” vary by month?",
  },
  {
    zh: "关于乡村振兴，2023 年和 2024 年的原文措辞有哪些不同？",
    en: "How did wording about rural revitalization differ between 2023 and 2024?",
  },
];

const linkStyle = "inline-flex min-h-11 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary hover:text-text-primary";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-3 focus:z-20 focus:rounded-md focus:bg-text-primary focus:p-3 focus:text-bg-primary">
        跳至正文 / Skip to content
      </a>
      <header className="border-b border-border-default">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-5 py-3 sm:px-8">
          <Logo size="sm" className="min-h-11 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary" />
          <nav aria-label="主导航 / Main navigation" className="flex flex-wrap items-center gap-x-6 text-sm text-text-secondary">
            <Link href="/pricing" className={linkStyle}>积分方案</Link>
            <a href="#english" lang="en" className={linkStyle}>English</a>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-5 sm:px-8">
        <section aria-labelledby="intro-title" className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <div>
            <p className="text-sm text-text-secondary">央视《新闻联播》 · 检索与分析</p>
            <h1 id="intro-title" className="mt-6 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.3] font-medium tracking-tight">
              从新闻原文，<br />看清报道脉络。
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-text-secondary">
              用一个问题，检索《新闻联播》中文文稿，比较报道频次与措辞，再回到原文核验。Lumina 帮你把零散报道放回时间与语境中。
            </p>
            <Link href="/chat" prefetch={false} className="mt-8 inline-flex min-h-12 items-center justify-center gap-4 rounded-md bg-text-primary px-5 text-sm font-medium text-bg-primary hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary">
              进入分析 <span aria-hidden="true">↗</span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-text-secondary">需邮箱登录与积分 · 按实际 token 用量计费</p>
          </div>

          <aside aria-labelledby="questions-title" className="border-t border-border-default pt-6 lg:pt-0 lg:border-t-0">
            <h2 id="questions-title" className="text-sm font-medium">从一个具体问题开始</h2>
            <p className="mt-2 text-sm text-text-secondary">示例问题，非生成答案 <span lang="en">/ Sample questions</span></p>
            <ol className="mt-4 divide-y divide-border-default">
              {questions.map((question, index) => (
                <li key={question.zh} className="flex gap-4 py-5">
                  <span aria-hidden="true" className="pt-0.5 font-mono text-sm text-text-secondary">0{index + 1}</span>
                  <div>
                    <p className="text-base leading-7">{question.zh}</p>
                    <p lang="en" className="mt-2 text-sm leading-6 text-text-secondary">{question.en}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        <section aria-labelledby="method-title" className="grid gap-8 border-t border-border-default py-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <h2 id="method-title" className="text-2xl font-medium">从检索到核验</h2>
            <p className="mt-3 text-sm leading-7 text-text-secondary">面向 2016 年起的中文文稿库。<br />检索结果取决于档案覆盖与所用词语。</p>
          </div>
          <dl className="space-y-7">
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-6">
              <dt className="font-medium">限定范围</dt>
              <dd className="text-sm leading-7 text-text-secondary">用关键词、完整短语和日期范围查找报道，找到与你的问题相关的文稿。</dd>
            </div>
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-6">
              <dt className="font-medium">观察变化</dt>
              <dd className="text-sm leading-7 text-text-secondary">按年、月、日汇总匹配报道的频次，比较不同时间段的关注点与措辞。</dd>
            </div>
            <div className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:gap-6">
              <dt className="font-medium">回到原文</dt>
              <dd className="text-sm leading-7 text-text-secondary">读取完整文稿，结合日期与原文链接核对分析依据。AI 回答和引用可能有误，重要结论请逐条核验。</dd>
            </div>
          </dl>
        </section>

        <section aria-labelledby="scope-title" className="grid gap-6 border-t border-border-default py-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <h2 id="scope-title" className="text-2xl font-medium">理解数据的边界</h2>
          <div className="space-y-4 text-sm leading-7 text-text-secondary">
            <p>报道频次反映的是档案中的报道关注度，不等同于现实世界的变化，也不能单独证明政策因果。Lumina 聚焦《新闻联播》，不提供全网实时监测或投资建议。</p>
            <p>分析需登录账户并使用积分；问题、回答、历史记录与积分用量由服务端保存，用于恢复会话和计费。主动分享后，持有链接的人可以阅读对应内容。</p>
          </div>
        </section>

        <section id="english" lang="en" aria-labelledby="english-title" className="scroll-mt-8 grid gap-6 border-t border-border-default py-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <p className="text-sm text-text-secondary">Lumina in English</p>
            <h2 id="english-title" className="mt-3 text-2xl leading-snug font-medium">Research Xinwen Lianbo,<br />from the source.</h2>
          </div>
          <div className="space-y-5 text-sm leading-7 text-text-secondary">
            <p>Explore CCTV’s Xinwen Lianbo Chinese transcript archive, starting in 2016. Search by keywords, exact phrases and date ranges; compare coverage frequency by day, month or year; read articles with dates and source links to check the evidence.</p>
            <p>Results depend on archive coverage and search terms. Coverage frequency is not a measure of real-world change or proof of policy causation. AI answers and citations can be wrong: verify important claims against the originals. Lumina does not offer all-news live monitoring or investment advice.</p>
            <p>Email login and credits are required for analysis, billed by actual token use. Questions, answers, history and credit usage are stored on the server for conversation recovery and billing. Anyone holding a link you choose to share can read that conversation. The source material and current chat interface are primarily Chinese.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-text-primary">
              <Link href="/chat" prefetch={false} className={linkStyle}>Open analysis (login required) <span aria-hidden="true" className="ml-2">↗</span></Link>
              <Link href="/pricing" className={linkStyle}>Credit pricing</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-default">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-5 py-5 text-sm text-text-secondary sm:px-8">
          <span>Lumina · 新闻联播 Agent</span>
          <nav aria-label="页脚 / Footer" className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className={linkStyle}>隐私说明 / <span lang="en" className="ml-1">Privacy</span></Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkStyle}>联系 / <span lang="en" className="ml-1">Contact</span></a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
