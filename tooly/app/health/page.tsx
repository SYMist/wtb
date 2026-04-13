import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";

export default function HealthPage() {
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
              BMI, 칼로리 등 건강 관련 계산기를 모아놓았습니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-lg border border-border p-12 text-center">
            <p className="text-lg text-text-secondary">
              곧 새로운 계산기가 추가됩니다.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
