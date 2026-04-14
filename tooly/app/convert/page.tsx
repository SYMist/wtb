import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
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
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              단위 변환기
            </h1>
            <p className="mt-3 text-text-secondary">
              평수, 환율 등 단위 변환 계산기를 모아놓았습니다.
            </p>
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
              <Link
                key={calc.id}
                href={calc.path}
                className="rounded-lg border border-border p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <h2 className="text-base font-semibold text-text-primary">
                  {calc.name}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {calc.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
