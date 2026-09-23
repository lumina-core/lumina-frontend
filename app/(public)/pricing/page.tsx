import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CreditPricing } from "@/components/billing/CreditPricing";
import { CONTACT_EMAIL } from "@/constants/contact";
import { CREDIT_PACKAGES } from "@/lib/billing/pricing";

export const metadata: Metadata = {
  title: "积分方案",
  description: "Lumina 按实际 token 消耗结算积分，查看积分方案与计费方式。",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="h-14 border-b border-white/[0.06]">
        <div className="mx-auto flex h-full w-full max-w-[960px] items-center justify-between px-5 sm:px-8">
          <Logo href="/chat" size="sm" />
          <Link
            href="/chat"
            className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60"
          >
            进入产品
          </Link>
        </div>
      </header>

      <CreditPricing contactEmail={CONTACT_EMAIL} packages={CREDIT_PACKAGES} />
    </div>
  );
}
