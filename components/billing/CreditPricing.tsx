import { Mail } from "lucide-react";
import {
  CREDIT_BILLING,
  creditPackageMailto,
  type CreditPackage,
} from "@/lib/billing/pricing";

interface CreditPricingProps {
  contactEmail: string;
  packages: CreditPackage[];
}

export function CreditPricing({ contactEmail, packages }: CreditPricingProps) {
  const example = CREDIT_BILLING.example;

  return (
    <main className="mx-auto w-full max-w-[880px] px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
      <div className="max-w-[640px]">
        <h1 className="text-balance text-[42px] font-medium leading-[1.08] tracking-[-0.045em] text-text-primary sm:text-[58px]">
          用多少，扣多少
        </h1>
        <p className="mt-5 max-w-[570px] text-[15px] leading-7 text-text-secondary sm:text-base">
          积分按模型实际输入和输出 tokens 换算。短问题花得少，长分析花得多；余额和每次消耗都会显示在结果下方。
        </p>
      </div>

      <section className="mt-14 border-y border-white/[0.08] py-6 sm:mt-20 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">一次真实分析示例</p>
          <p className="mt-1.5 text-sm text-text-tertiary">
            输入 {example.inputTokens.toLocaleString()} / 输出 {example.outputTokens.toLocaleString()} tokens
          </p>
        </div>
        <div className="mt-5 text-left sm:mt-0 sm:text-right">
          <p className="text-3xl font-medium tracking-[-0.04em] text-text-primary">
            {example.credits} 积分
          </p>
          <p className="mt-1 text-xs text-text-tertiary">实际消耗会随回答长度变化</p>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="credit-packages">
        <div>
          <h2 id="credit-packages" className="text-2xl font-medium tracking-[-0.025em] text-text-primary">
            积分方案
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            1 元对应约 {CREDIT_BILLING.creditsPerCny.toLocaleString()} 积分
          </p>
        </div>

        <div className="mt-7 border-t border-white/[0.08]">
          {packages.map((creditPackage) => (
            <div
              key={creditPackage.id}
              className="grid gap-5 border-b border-white/[0.08] py-7 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-8"
            >
              <p className="text-3xl font-medium tracking-[-0.04em] text-text-primary">
                ¥{creditPackage.priceCny}
              </p>
              <div>
                <p className="text-base font-medium text-text-primary">
                  {creditPackage.credits.toLocaleString()} 积分
                </p>
                <p className="mt-1.5 text-sm leading-6 text-text-tertiary">
                  {creditPackage.description}
                </p>
              </div>
              <a
                href={creditPackageMailto(contactEmail, creditPackage)}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-white/[0.12] px-4 text-sm font-medium text-text-primary transition-colors hover:border-white/[0.22] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
              >
                <Mail className="h-4 w-4" />
                邮件联系
              </a>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 max-w-[620px] text-xs leading-6 text-text-tertiary">
        暂不提供在线支付。邮件确认后再人工处理积分；这不是自动续费，也不会保存银行卡信息。注册赠送 100 积分，每日签到可领取 20 积分。
      </p>
    </main>
  );
}
