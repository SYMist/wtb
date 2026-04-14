import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import { calculateSalary } from "@/lib/calculators/salary";

const SALARY_AMOUNTS = [
  2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500,
  8000, 8500, 9000, 9500, 10000, 12000, 15000, 20000,
];

export function generateStaticParams() {
  return SALARY_AMOUNTS.map((amount) => ({ amount: String(amount) }));
}

interface PageProps {
  params: Promise<{ amount: string }>;
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function getContextContent(wan: number) {
  if (wan <= 3000)
    return {
      title: "사회초년생을 위한 절세 팁",
      content:
        "연봉 3,000만원 이하 구간은 소득세 부담이 비교적 낮습니다. 비과세 항목(식대 월 20만원, 자가운전보조금 등)을 최대한 활용하고, 청년 소득세 감면(5년간 90% 감면) 대상인지 확인하세요. 연말정산 시 신용카드 공제, 월세 세액공제도 적극 활용하면 추가 환급을 받을 수 있습니다.",
    };
  if (wan <= 5000)
    return {
      title: "중간 소득 구간 절세 전략",
      content:
        "연봉 3,500~5,000만원 구간은 근로소득 세율이 15~24%로 적용되는 구간입니다. 부양가족 공제를 통해 과세표준을 낮출 수 있으며, IRP(개인형퇴직연금)와 연금저축 납입으로 세액공제 혜택을 받을 수 있습니다. 연말정산 미리보기 서비스로 예상 환급액을 확인해보세요.",
    };
  if (wan <= 8000)
    return {
      title: "고소득 구간 유의사항",
      content:
        "연봉 5,500~8,000만원 구간은 소득세율 24~35%가 적용될 수 있어 공제 항목 관리가 중요합니다. 건강보험료 상한에 근접할 수 있으며, 국민연금은 상한소득월액(590만원) 기준으로 산정됩니다. 기부금 공제, 의료비 공제 등을 적극 활용하세요.",
    };
  return {
    title: "고액 연봉자 세금 관리",
    content:
      "연봉 8,500만원 이상은 최고 세율 구간(35~45%)에 해당할 수 있습니다. 종합소득세 대상 여부를 확인하고, 절세형 금융상품(ISA, 연금저축)을 활용하세요. 건강보험료 본인부담 상한제도 함께 확인하면 좋습니다.",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { amount } = await params;
  const wan = Number(amount);
  const annual = wan * 10000;
  const result = calculateSalary({
    annualSalary: annual,
    dependents: 1,
    children: 0,
    nonTaxableAmount: 0,
  });
  const monthlyWan = Math.round(result.monthlyTakeHome / 10000);

  return {
    title: `연봉 ${wan.toLocaleString()}만원 실수령액 - 월 ${monthlyWan.toLocaleString()}만원`,
    description: `연봉 ${wan.toLocaleString()}만원의 월 실수령액은 약 ${monthlyWan.toLocaleString()}만원입니다. 4대보험, 소득세 공제 내역을 확인하세요.`,
    alternates: {
      canonical: `/finance/salary-calculator/${amount}`,
    },
  };
}

export default async function SalaryAmountPage({ params }: PageProps) {
  const { amount } = await params;
  const wan = Number(amount);
  const annual = wan * 10000;
  const result = calculateSalary({
    annualSalary: annual,
    dependents: 1,
    children: 0,
    nonTaxableAmount: 0,
  });
  const ctx = getContextContent(wan);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `연봉 ${wan.toLocaleString()}만원 실수령액은?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `연봉 ${wan.toLocaleString()}만원의 월 실수령액은 약 ${fmt(result.monthlyTakeHome)}원(부양가족 1인, 비과세 없음 기준)입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `연봉 ${wan.toLocaleString()}만원 4대보험 공제액은?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `월 4대보험 공제 합계는 약 ${fmt(result.deductions.slice(0, 4).reduce((s, d) => s + d.monthly, 0))}원입니다.`,
        },
      },
    ],
  };

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-primary font-medium mb-2">연봉 실수령액</p>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              연봉 {wan.toLocaleString()}만원 실수령액
            </h1>
            <p className="mt-2 text-text-secondary">
              부양가족 1인(본인), 비과세 0원 기준 · 2026년 4대보험 요율 적용
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
          {/* 핵심 결과 */}
          <div className="rounded-xl border border-primary bg-primary-light p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-text-secondary">월 실수령액</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {fmt(result.monthlyTakeHome)}
                  <span className="ml-1 text-lg font-medium">원</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">연 실수령액</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                  {fmt(result.annualTakeHome)}
                  <span className="ml-1 text-base font-medium">원</span>
                </p>
              </div>
            </div>
          </div>

          {/* 공제 내역 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              월 공제 내역
            </h2>
            <div className="space-y-3">
              {result.deductions.map((d) => (
                <div key={d.name} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{d.name}</span>
                  <span className="tabular-nums font-medium text-text-primary">
                    {fmt(d.monthly)}원
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between text-sm font-semibold">
                <span className="text-text-primary">공제 합계</span>
                <span className="tabular-nums text-negative">
                  -{fmt(result.totalDeductionMonthly)}원
                </span>
              </div>
            </div>
          </div>

          {/* 맥락 콘텐츠 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-3">
              {ctx.title}
            </h2>
            <p className="text-sm leading-relaxed text-text-secondary">
              {ctx.content}
            </p>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-primary/30 bg-primary-light p-6 text-center">
            <p className="text-sm text-text-secondary mb-3">
              부양가족, 비과세 항목을 반영한 정확한 계산이 필요하다면?
            </p>
            <Link
              href={`/finance/salary-calculator?annual=${annual}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              내 연봉으로 직접 계산하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 다른 연봉 구간 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              다른 연봉 구간 실수령액
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SALARY_AMOUNTS.filter((a) => a !== wan)
                .slice(0, 8)
                .map((a) => (
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
