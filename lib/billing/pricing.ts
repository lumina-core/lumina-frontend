export interface CreditPackage {
  id: string;
  priceCny: number;
  credits: number;
  description: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "starter",
    priceCny: 20,
    credits: 20_000,
    description: "适合偶尔检索、验证政策信号",
  },
  {
    id: "regular",
    priceCny: 60,
    credits: 65_000,
    description: "适合持续研究，额外包含 5,000 积分",
  },
];

export const CREDIT_BILLING = {
  creditsPerCny: 1_000,
  minimumCredits: 1,
  example: {
    inputTokens: 744,
    outputTokens: 59,
    credits: 4,
  },
} as const;

export function creditPackageMailto(
  contactEmail: string,
  creditPackage: CreditPackage,
) {
  const subject = `积分方案咨询：¥${creditPackage.priceCny}`;
  const body = `你好，我想了解 ¥${creditPackage.priceCny} / ${creditPackage.credits.toLocaleString("zh-CN")} 积分方案。`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
