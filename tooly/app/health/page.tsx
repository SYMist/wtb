import type { Metadata } from "next";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import CalculatorCard from "@/components/common/CalculatorCard";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "건강 계산기 모음 - BMI, 기초대사량, 칼로리",
  description: "BMI 체질량지수, 기초대사량(BMR), 일일 권장 칼로리를 간편하게 계산하세요. 대한비만학회 기준 적용.",
  openGraph: {
    title: "건강 계산기 모음 | Tooly",
    description: "BMI, 기초대사량, 칼로리 등 건강 관련 계산기 모음",
  },
};

export default function HealthPage() {
  const calcs = getCalculatorsByCategory("health");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                건강 계산기
              </h1>
              <p className="mt-3 text-text-secondary">
                BMI, 기초대사량, 칼로리 등 건강 관련 계산기를 모아놓았습니다.
              </p>
            </div>
            <svg className="hidden md:block flex-shrink-0" width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="80" cy="56" r="44" fill="#DCFCE7"/>
              <path d="M80 30 C80 30, 56 48, 56 64 C56 76.8 67.2 86 80 86 C92.8 86 104 76.8 104 64 C104 48 80 30 80 30Z" fill="#86EFAC"/>
              <path d="M80 86 L80 96" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round"/>
              <path d="M68 96 L92 96" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round"/>
              <path d="M56 62 L66 62 L70 52 L76 72 L82 58 L86 66 L90 58 L94 66 L104 62" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-lg bg-surface p-6 text-sm leading-relaxed text-text-secondary">
            <p>
              Tooly 건강 계산기는 대한비만학회 기준과 과학적 공식을 적용하여 정확한 결과를 제공합니다.
              BMI 계산기로 체질량지수를 확인하고, 기초대사량 계산기에서 해리스-베네딕트 또는
              미플린-세인트지어 공식으로 하루 기본 에너지 소비량을 파악한 뒤,
              칼로리 계산기에서 활동 수준에 맞는 일일 권장 칼로리를 확인하세요.
              BMI → 기초대사량 → 칼로리 순서로 활용하면 체계적인 건강 관리가 가능합니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calcs.map((calc) => (
              <CalculatorCard key={calc.id} calc={calc} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
