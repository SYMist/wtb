import type { Metadata } from "next";
import { Suspense } from "react";
import IncomeTaxCalculatorClient from "./IncomeTaxCalculatorClient";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: "종합소득세 계산기 2026 — 납부·환급 세액 즉시 계산 | Tooly",
  description:
    "2026년 5월 종합소득세 신고를 앞두고 예상 납부·환급 세액을 계산해보세요. 근로소득·사업소득·기타소득 합산, 인적공제 반영, 기납부세액 차감까지 자동 계산.",
  keywords: ["종합소득세", "종합소득세계산기", "5월종합소득세", "프리랜서세금계산", "사업소득세계산", "납부세액계산", "환급세액계산"],
  alternates: {
    canonical: "https://tooly.deluxo.co.kr/finance/income-tax-calculator",
  },
  openGraph: {
    title: "종합소득세 계산기 2026 | Tooly",
    description: "근로·사업·기타소득 합산 종합소득세 납부·환급 예상액 계산",
  },
};

export default function IncomeTaxCalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <IncomeTaxCalculatorClient />
    </Suspense>
  );
}
