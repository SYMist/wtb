import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import {
  calcEqualPayment,
  calcEqualPrincipal,
  calcBulletPayment,
} from "@/lib/calculators/loan";

// 대출금액 (만원 단위)
const LOAN_AMOUNTS = [
  5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000,
  70000, 80000, 90000, 100000,
];

const RATE = 3.5;
const TERM = 30;

export function generateStaticParams() {
  return LOAN_AMOUNTS.map((amount) => ({ amount: String(amount) }));
}

interface PageProps {
  params: Promise<{ amount: string }>;
}

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function fmtEok(n: number): string {
  if (Math.abs(n) >= 100_000_000) {
    const eok = n / 100_000_000;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  }
  return `${Math.round(n / 10_000).toLocaleString()}만`;
}

function getContextContent(wan: number) {
  if (wan <= 10000)
    return {
      title: "소액 대출 시 알아두면 좋은 점",
      content:
        "1억원 이하 대출은 신용대출이나 전세자금대출로 진행하는 경우가 많습니다. 신용대출은 주담대 대비 금리가 높지만 담보 없이 가능하며, 전세대출은 전세보증금의 80%까지 가능합니다. DSR 규제가 적용되므로 다른 대출이 있다면 총 상환 부담을 확인하세요.",
    };
  if (wan <= 30000)
    return {
      title: "주택담보대출 기본 가이드",
      content:
        "1.5~3억원 대출은 일반적인 주택담보대출(주담대) 규모입니다. LTV(담보인정비율)는 지역에 따라 40~70%까지 차이가 있으며, DTI(총부채상환비율)와 DSR(총부채원리금상환비율) 규제가 함께 적용됩니다. 고정금리와 변동금리 중 본인의 상환 계획에 맞는 방식을 선택하세요.",
    };
  if (wan <= 50000)
    return {
      title: "고액 주담대 규제 유의사항",
      content:
        "3.5~5억원 대출은 DSR 40% 규제에 특히 주의해야 합니다. 연 소득 대비 전체 대출의 원리금 상환액 비율이 40%를 넘으면 대출이 제한됩니다. 9억원 초과 주택은 LTV 규제가 더 강화되니 매매가 대비 대출 한도를 미리 확인하세요.",
    };
  return {
    title: "고가 주택 대출 전략",
    content:
      "6억원 이상 고액 대출은 DSR 규제와 고가주택 대출 제한을 꼼꼼히 확인해야 합니다. 15억원 초과 아파트는 주담대 취급이 제한되며, 공시가격 기준 종합부동산세 대상 여부도 함께 검토하세요. 분할 상환 계획을 세워 총 이자 부담을 최소화하는 것이 중요합니다.",
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { amount } = await params;
  const wan = Number(amount);
  const principal = wan * 10000;
  const result = calcEqualPayment({
    principal,
    annualRate: RATE,
    termYears: TERM,
    gracePeriodYears: 0,
  });
  const monthlyWan = Math.round(result.monthlyPayment / 10000);

  return {
    title: `${fmtEok(principal)} 대출 월 상환액 - 원리금균등 ${monthlyWan.toLocaleString()}만원`,
    description: `${fmtEok(principal)} 대출(금리 ${RATE}%, ${TERM}년) 시 원리금균등 월 상환액은 약 ${monthlyWan.toLocaleString()}만원입니다. 상환 방식별 비교를 확인하세요.`,
    alternates: {
      canonical: `/finance/loan-calculator/${amount}`,
    },
  };
}

export default async function LoanAmountPage({ params }: PageProps) {
  const { amount } = await params;
  const wan = Number(amount);
  const principal = wan * 10000;

  const input = { principal, annualRate: RATE, termYears: TERM, gracePeriodYears: 0 };
  const equal = calcEqualPayment(input);
  const principal_ = calcEqualPrincipal(input);
  const bullet = calcBulletPayment(input);
  const ctx = getContextContent(wan);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${fmtEok(principal)} 대출 월 상환액은?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `금리 ${RATE}%, ${TERM}년 기준 원리금균등 월 ${fmt(equal.monthlyPayment)}원, 원금균등 첫 달 ${fmt(principal_.monthlyPayment)}원입니다.`,
        },
      },
      {
        "@type": "Question",
        name: `${fmtEok(principal)} 대출 총 이자는?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `원리금균등 ${fmtEok(equal.totalInterest)}원, 원금균등 ${fmtEok(principal_.totalInterest)}원, 만기일시 ${fmtEok(bullet.totalInterest)}원입니다.`,
        },
      },
    ],
  };

  const methods = [
    { name: "원리금균등", monthly: equal.monthlyPayment, totalInterest: equal.totalInterest, total: equal.totalPayment, desc: "매월 동일 금액 상환" },
    { name: "원금균등", monthly: principal_.monthlyPayment, totalInterest: principal_.totalInterest, total: principal_.totalPayment, desc: "초기 부담 크나 총 이자 절약" },
    { name: "만기일시", monthly: bullet.monthlyPayment, totalInterest: bullet.totalInterest, total: bullet.totalPayment, desc: "만기까지 이자만 납부" },
  ];

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-primary font-medium mb-2">주택대출 시뮬레이션</p>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {fmtEok(principal)}원 대출 월 상환액
            </h1>
            <p className="mt-2 text-text-secondary">
              금리 {RATE}% · {TERM}년 상환 기준
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
          {/* 상환 방식 비교 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              상환 방식 비교
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-text-secondary">방식</th>
                    <th className="pb-3 text-right font-medium text-text-secondary">월 상환액</th>
                    <th className="pb-3 text-right font-medium text-text-secondary">총 이자</th>
                    <th className="pb-3 text-right font-medium text-text-secondary">총 상환액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {methods.map((m) => (
                    <tr key={m.name}>
                      <td className="py-3">
                        <div className="font-medium text-text-primary">{m.name}</div>
                        <div className="text-xs text-text-secondary">{m.desc}</div>
                      </td>
                      <td className="py-3 text-right tabular-nums font-medium text-text-primary">
                        {fmt(m.monthly)}원
                      </td>
                      <td className="py-3 text-right tabular-nums text-text-primary">
                        {fmtEok(m.totalInterest)}원
                      </td>
                      <td className="py-3 text-right tabular-nums text-text-primary">
                        {fmtEok(m.total)}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-lg bg-positive-light px-4 py-2 text-xs text-positive">
              원금균등이 원리금균등보다 이자{" "}
              <span className="font-semibold tabular-nums">
                {fmt(equal.totalInterest - principal_.totalInterest)}원
              </span>{" "}
              절약
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
              금리, 거치기간, DSR을 반영한 상세 시뮬레이션이 필요하다면?
            </p>
            <Link
              href={`/finance/loan-calculator?loan=${principal}&rate=${RATE}&term=${TERM}`}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors"
            >
              내 조건으로 직접 계산하기
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 다른 대출 금액 */}
          <div className="rounded-xl border border-border p-6">
            <h2 className="text-base font-semibold text-text-primary mb-4">
              다른 대출 금액 상환액
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {LOAN_AMOUNTS.filter((a) => a !== wan)
                .slice(0, 10)
                .map((a) => (
                  <Link
                    key={a}
                    href={`/finance/loan-calculator/${a}`}
                    className="rounded-lg border border-border px-3 py-2 text-center text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
                  >
                    {fmtEok(a * 10000)}
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
