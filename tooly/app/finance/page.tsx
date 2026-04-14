import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "금융 계산기 모음 - 대출, 연봉, 투자, 세금",
  description: "주택대출 이자, 연봉 실수령액, 복리 수익, 전월세 전환, 퇴직금, 양도소득세, 부가세 등 금융 계산기를 한곳에서 무료로 이용하세요.",
  openGraph: {
    title: "금융 계산기 모음 | Tooly",
    description: "주택대출, 연봉 실수령액, 복리 계산 등 금융 관련 계산기 모음",
  },
};

export default function FinancePage() {
  const calculators = getCalculatorsByCategory("finance");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              금융 계산기
            </h1>
            <p className="mt-3 text-text-secondary">
              주택대출, 연봉 실수령액, 복리 계산 등 금융 관련 계산기를 모아놓았습니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-lg bg-surface p-6 text-sm leading-relaxed text-text-secondary">
            <p>
              Tooly 금융 계산기는 정확한 공식과 2026년 최신 세율·보험요율을 반영하여 계산합니다.
              주택대출 시뮬레이터로 원리금균등·원금균등·만기일시 상환 방식을 비교하고,
              연봉 실수령액 분석기로 4대보험과 소득세 공제 후 실제 수령액을 확인하세요.
              투자 복리 계산기, 예적금 이자 계산기, 전월세 전환 계산기 등으로
              재테크 의사결정에 필요한 수치를 빠르게 산출할 수 있습니다.
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
