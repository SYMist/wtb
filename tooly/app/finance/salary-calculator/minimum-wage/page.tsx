import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import { calculateSalary } from "@/lib/calculators/salary";

// 2026년 최저임금
const HOURLY = 10_030;
const MONTHLY_HOURS = 209; // 주 40시간 + 주휴수당
const MONTHLY = HOURLY * MONTHLY_HOURS; // 2,096,270원
const ANNUAL = MONTHLY * 12; // 25,155,240원
const DAILY = HOURLY * 8; // 80,240원

export const metadata: Metadata = {
  title: "2026년 최저임금 실수령액 — 시급·월급·연봉 환산 | Tooly",
  description: `2026년 최저임금 시급 ${HOURLY.toLocaleString()}원 기준 월급 ${MONTHLY.toLocaleString()}원의 실수령액, 4대보험·소득세 공제 내역을 한눈에 확인하세요.`,
  keywords: ["최저임금실수령액", "2026최저임금", "최저시급실수령", "최저임금월급", "최저임금계산기"],
  alternates: {
    canonical: "https://tooly.deluxo.co.kr/finance/salary-calculator/minimum-wage",
  },
  openGraph: {
    title: "2026 최저임금 실수령액 | Tooly",
    description: `시급 ${HOURLY.toLocaleString()}원 → 월급 ${MONTHLY.toLocaleString()}원 → 실수령 자동 계산`,
  },
};

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export default function MinimumWagePage() {
  const result = calculateSalary({
    annualSalary: ANNUAL,
    dependents: 1,
    children: 0,
    nonTaxableAmount: 0,
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "2026년 최저임금 시급은 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `2026년 최저임금은 시급 ${HOURLY.toLocaleString()}원입니다. 2025년 대비 1.7% 인상되었습니다.`,
        },
      },
      {
        "@type": "Question",
        name: "2026년 최저임금 월급 실수령액은 얼마인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `주 40시간 근무 기준(월 209시간) 월급은 ${MONTHLY.toLocaleString()}원이며, 4대보험·소득세 공제 후 실수령액은 약 ${fmt(result.monthlyTakeHome)}원입니다(부양가족 1인 기준).`,
        },
      },
      {
        "@type": "Question",
        name: "주휴수당이란 무엇인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "주 15시간 이상 근무한 근로자에게 지급되는 유급 휴일 수당입니다. 주 40시간 근무 시 월 209시간(기본 174시간 + 주휴 35시간)을 기준으로 월급을 계산합니다.",
        },
      },
      {
        "@type": "Question",
        name: "최저임금 위반은 어떻게 신고하나요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "고용노동부 고객상담센터(1350) 또는 고용노동부 홈페이지(minwage.go.kr)에서 신고할 수 있습니다. 최저임금 위반 시 사업주는 3년 이하 징역 또는 2천만원 이하 벌금에 처해질 수 있습니다.",
        },
      },
    ],
  };

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium text-primary mb-2">2026년 최저임금</p>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              2026년 최저임금 실수령액
            </h1>
            <p className="mt-2 text-text-secondary text-sm">
              시급 · 월급 · 연봉 환산 + 4대보험 공제 내역 자동 계산
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
          {/* 핵심 수치 카드 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "시급", value: `${fmt(HOURLY)}원` },
              { label: "일급 (8시간)", value: `${fmt(DAILY)}원` },
              { label: "월급 (209시간)", value: `${fmt(MONTHLY)}원` },
              { label: "연봉 환산", value: `${fmt(ANNUAL)}원` },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="text-xs text-text-secondary mb-1">{label}</p>
                <p className="text-base font-bold tabular-nums text-text-primary">{value}</p>
              </div>
            ))}
          </div>

          {/* 실수령액 결과 */}
          <div className="rounded-xl border-2 border-primary bg-primary-light p-6">
            <p className="text-sm font-medium text-primary mb-1">4대보험·소득세 공제 후</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-text-secondary">월 실수령액</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {fmt(result.monthlyTakeHome)}<span className="ml-1 text-lg font-medium">원</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">연 실수령액</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                  {fmt(result.annualTakeHome)}<span className="ml-1 text-sm font-medium">원</span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary">부양가족 1인(본인), 비과세 없음 기준 · 2026년 4대보험 요율 적용</p>
          </div>

          {/* 공제 내역 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">월 공제 내역</h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>월 급여</span>
                <span className="tabular-nums font-medium text-text-primary">{fmt(result.monthlySalary)}원</span>
              </div>
              {result.deductions.map((d) => (
                <div key={d.name} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{d.name} <span className="text-xs">({d.rate.toFixed(2)}%)</span></span>
                  <span className="tabular-nums font-medium text-negative">−{fmt(d.monthly)}원</span>
                </div>
              ))}
              <div className="border-t border-border pt-2.5 flex justify-between text-sm font-semibold">
                <span>공제 합계</span>
                <span className="tabular-nums text-negative">−{fmt(result.totalDeductionMonthly)}원</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>실수령액</span>
                <span className="tabular-nums">{fmt(result.monthlyTakeHome)}원</span>
              </div>
            </div>
          </div>

          {/* 부양가족별 비교 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">부양가족 수별 월 실수령액</h2>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((dep) => {
                const r = calculateSalary({ annualSalary: ANNUAL, dependents: dep, children: 0, nonTaxableAmount: 0 });
                return (
                  <div key={dep} className="flex justify-between text-sm">
                    <span className="text-text-secondary">부양가족 {dep}인 {dep === 1 ? "(본인만)" : ""}</span>
                    <span className="tabular-nums font-medium text-text-primary">{fmt(r.monthlyTakeHome)}원</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQ */}
          <div className="rounded-xl border border-border divide-y divide-border">
            <div className="p-4">
              <h2 className="text-base font-semibold text-text-primary">자주 묻는 질문</h2>
            </div>
            {faqSchema.mainEntity.map((item, i) => (
              <details key={i} className="group p-4">
                <summary className="cursor-pointer text-sm font-medium text-text-primary list-none flex justify-between items-center">
                  {item.name}
                  <span className="ml-2 shrink-0 text-text-secondary group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-primary/30 bg-primary-light p-6 text-center">
            <p className="text-sm font-medium text-text-primary mb-1">내 연봉으로 직접 계산하기</p>
            <p className="text-xs text-text-secondary mb-4">부양가족, 비과세, 월급 입력 방식 지원</p>
            <Link
              href={`/finance/salary-calculator?annual=${ANNUAL}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
            >
              연봉 실수령액 계산기로 이동
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 관련 링크 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">연봉 구간별 실수령액</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000].map((a) => (
                <Link
                  key={a}
                  href={`/finance/salary-calculator/${a}`}
                  className="rounded-lg border border-border px-3 py-2 text-center text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {a.toLocaleString()}만원
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
