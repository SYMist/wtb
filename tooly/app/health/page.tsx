import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import { getCalculatorsByCategory } from "@/lib/data/calculators";

export default function HealthPage() {
  const calcs = getCalculatorsByCategory("health");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-12">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              건강 계산기
            </h1>
            <p className="mt-3 text-text-secondary">
              BMI, 기초대사량, 칼로리 등 건강 관련 계산기를 모아놓았습니다.
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
