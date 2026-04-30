import type { Metadata } from "next";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import CalculatorCard from "@/components/common/CalculatorCard";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "날짜 계산기 모음 - D-Day, 나이, 근무일수",
  description: "D-Day 카운트다운, 두 날짜 사이 기간, 만 나이, 공휴일 제외 근무일수를 계산하세요.",
  openGraph: {
    title: "날짜 계산기 모음 | Tooly",
    description: "D-Day, 만 나이, 근무일수 등 날짜 관련 계산기 모음",
  },
};

export default function DatePage() {
  const calcs = getCalculatorsByCategory("date");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl flex items-center justify-between gap-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                날짜 계산기
              </h1>
              <p className="mt-3 text-text-secondary">
                D-Day, 날짜 차이, 만 나이, 근무일수 등 날짜 관련 계산기를 모아놓았습니다.
              </p>
            </div>
            <svg className="hidden md:block flex-shrink-0" width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="24" y="20" width="112" height="92" rx="8" fill="#EFF6FF"/>
              <rect x="24" y="20" width="112" height="32" rx="8" fill="#BFDBFE"/>
              <rect x="24" y="40" width="112" height="12" fill="#BFDBFE"/>
              <circle cx="52" cy="16" r="6" fill="white" stroke="#3B82F6" strokeWidth="2.5"/>
              <circle cx="108" cy="16" r="6" fill="white" stroke="#3B82F6" strokeWidth="2.5"/>
              <rect x="38" y="62" width="16" height="14" rx="3" fill="#3B82F6"/>
              <rect x="62" y="62" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <rect x="86" y="62" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <rect x="110" y="62" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <rect x="38" y="84" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <rect x="62" y="84" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <rect x="86" y="84" width="16" height="14" rx="3" fill="#BFDBFE"/>
              <text x="44" y="73" fontSize="9" fill="white" fontWeight="bold" textAnchor="middle">D</text>
            </svg>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-lg bg-surface p-6 text-sm leading-relaxed text-text-secondary">
            <p>
              시험·기념일·출산 예정일까지의 D-Day 카운트다운, 두 날짜 사이의 정확한 기간 계산,
              2023년 만 나이 통일법에 따른 만 나이 계산, 2026년 법정 공휴일과 대체공휴일을
              반영한 근무일수 계산을 제공합니다. 윤년을 포함한 정확한 일수 계산으로
              일정 관리와 행정 업무에 활용하세요.
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
