import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export const metadata: Metadata = {
  title: "생활 계산기 모음 - 학점, 전기요금, 퍼센트",
  description: "학점(GPA) 계산, 전기요금 누진세, 퍼센트 비율, 속도 단위 변환 등 일상 계산기를 무료로 이용하세요.",
  openGraph: {
    title: "생활 계산기 모음 | Tooly",
    description: "학점, 전기요금, 퍼센트 등 일상생활 계산기 모음",
  },
};

export default function LifePage() {
  const calcs = getCalculatorsByCategory("life");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              생활 계산기
            </h1>
            <p className="mt-3 text-text-secondary">
              학점, 전기요금, 퍼센트 등 일상에 유용한 계산기를 모아놓았습니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="rounded-lg bg-surface p-6 text-sm leading-relaxed text-text-secondary">
            <p>
              대학생을 위한 4.3/4.5 만점 학점(GPA) 계산기, 한전 누진제를 반영한 전기요금 계산기,
              증가율·감소율·할인율을 구하는 퍼센트 계산기, km/h·m/s·mph 간 속도 단위 변환기를
              제공합니다. 복잡한 공식을 몰라도 값을 입력하면 즉시 정확한 결과를 확인할 수 있습니다.
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
