import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
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
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              날짜 계산기
            </h1>
            <p className="mt-3 text-text-secondary">
              D-Day, 날짜 차이, 만 나이, 근무일수 등 날짜 관련 계산기를 모아놓았습니다.
            </p>
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
              <Link
                key={calc.id}
                href={calc.path}
                className="rounded-lg border border-border p-6 transition-all hover:border-primary hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-text-primary">
                  {calc.name}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
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
