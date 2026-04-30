import type { Metadata } from "next";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import CalculatorCard from "@/components/common/CalculatorCard";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "단위 변환기 모음 - 평수, 환율 변환",
  description: "평수↔제곱미터 면적 변환, 원화↔외화 환율 변환을 간편하게 계산하세요.",
  openGraph: {
    title: "단위 변환기 모음 | Tooly",
    description: "평수, 환율 등 단위 변환 도구 모음",
  },
};

export default function ConvertPage() {
  const calculators = getCalculatorsByCategory("convert");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                단위 변환기
              </h1>
              <p className="mt-3 text-text-secondary">
                평수, 환율 등 단위 변환 계산기를 모아놓았습니다.
              </p>
            </div>
            <svg className="hidden md:block flex-shrink-0" width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="20" y="36" width="52" height="48" rx="8" fill="#EDE9FE"/>
              <rect x="88" y="36" width="52" height="48" rx="8" fill="#DDD6FE"/>
              <text x="46" y="66" fontSize="14" fill="#7C3AED" fontWeight="bold" textAnchor="middle">평</text>
              <text x="114" y="66" fontSize="11" fill="#7C3AED" fontWeight="bold" textAnchor="middle">m²</text>
              <path d="M76 52 L84 52" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M80 46 L88 52 L80 58" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M84 68 L76 68" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M80 74 L72 68 L80 62" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="46" cy="96" r="10" fill="#7C3AED" opacity="0.15"/>
              <circle cx="114" cy="96" r="10" fill="#7C3AED" opacity="0.15"/>
              <text x="46" y="100" fontSize="9" fill="#7C3AED" textAnchor="middle">KRW</text>
              <text x="114" y="100" fontSize="9" fill="#7C3AED" textAnchor="middle">USD</text>
            </svg>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-lg bg-surface p-6 text-sm leading-relaxed text-text-secondary">
            <p>
              부동산 면적 표기에서 자주 쓰이는 평(坪)과 제곱미터(m²) 간 변환,
              해외 송금·여행 시 필요한 원화↔외화 환율 변환을 지원합니다.
              평수 계산기는 전용면적·공급면적 모두 활용할 수 있으며,
              환율 변환기는 한국수출입은행 고시 환율을 기반으로 주요 통화 간 변환을 제공합니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc) => (
              <CalculatorCard key={calc.id} calc={calc} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
