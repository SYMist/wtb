"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

import {
  calcEqualPayment,
  calcEqualPrincipal,
  calcBulletPayment,
  calcDSR,
  type LoanInput,
} from "@/lib/calculators/loan";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import ContextCTA from "@/components/common/ContextCTA";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";
import interestRates from "@/lib/data/interest-rates.json";

// Dynamic imports for recharts to avoid SSR
const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const CHART_COLORS = {
  equalPayment: "#2563EB",
  equalPrincipal: "#7C3AED",
  bullet: "#DC2626",
  principal: "#2563EB",
  interest: "#93C5FD",
};

function LoanCalculatorInner() {
  const searchParams = useSearchParams();

  const [price, setPrice] = useState(() => {
    const v = searchParams.get("price");
    return v ? Number(v) : 500_000_000;
  });
  const [loanAmountInput, setLoanAmountInput] = useState(() => {
    const v = searchParams.get("loan");
    return v ? Number(v) : 350_000_000;
  });
  const [annualRate, setAnnualRate] = useState(() => {
    const v = searchParams.get("rate");
    return v ? Number(v) : 3.5;
  });
  const [termYears, setTermYears] = useState(() => {
    const v = searchParams.get("term");
    return v ? Number(v) : 30;
  });
  const [gracePeriodYears, setGracePeriodYears] = useState(() => {
    const v = searchParams.get("grace");
    return v ? Number(v) : 0;
  });
  const [annualIncome, setAnnualIncome] = useState(() => {
    const v = searchParams.get("income");
    return v ? Number(v) : 0;
  });

  const loanAmount = loanAmountInput;
  const ownFundsRatio = price > 0 ? Math.round((1 - loanAmount / price) * 1000) / 10 : 0;

  const safeGrace = Math.min(gracePeriodYears, termYears - 1);

  const loanInput: LoanInput = useMemo(
    () => ({
      principal: loanAmount,
      annualRate,
      termYears,
      gracePeriodYears: safeGrace,
    }),
    [loanAmount, annualRate, termYears, safeGrace]
  );

  const equalPayment = useMemo(() => calcEqualPayment(loanInput), [loanInput]);
  const equalPrincipal = useMemo(
    () => calcEqualPrincipal(loanInput),
    [loanInput]
  );
  const bullet = useMemo(() => calcBulletPayment(loanInput), [loanInput]);

  const dsrValue = useMemo(() => {
    if (annualIncome <= 0) return 0;
    return calcDSR(equalPayment.monthlyPayment * 12, annualIncome);
  }, [equalPayment.monthlyPayment, annualIncome]);

  // Monthly schedule sampled every 12 months for chart
  const scheduleChartData = useMemo(() => {
    return equalPayment.schedule
      .filter((item, idx) => idx % 12 === 0)
      .map((item) => ({
        month: `${Math.ceil(item.month / 12)}년`,
        principal: Math.round(item.principal),
        interest: Math.round(item.interest),
      }));
  }, [equalPayment.schedule]);

  const comparisonChartData = [
    { name: "원리금균등", totalInterest: equalPayment.totalInterest },
    { name: "원금균등", totalInterest: equalPrincipal.totalInterest },
    { name: "만기일시", totalInterest: bullet.totalInterest },
  ];

  const comparisonColors = [
    CHART_COLORS.equalPayment,
    CHART_COLORS.equalPrincipal,
    CHART_COLORS.bullet,
  ];

  const calculator = getCalculator("loan-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              주택대출 종합 시뮬레이터
            </h1>
            <p className="mt-2 text-text-secondary">
              매매가, 금리, 기간을 입력하면 원리금균등·원금균등·만기일시 상환
              방식을 한눈에 비교합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs ── */}
            <div className="flex-1 space-y-6">
              {/* 매매가 */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  대출 조건 입력
                </h2>

                {/* 매매가 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>매매가</span>
                    <span className="tabular-nums text-primary">
                      {fmt(price)}원
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={3_000_000_000}
                    step={10_000_000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={price.toLocaleString("ko-KR")}
                      onChange={(e) => {
                        const num = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                        setPrice(num);
                      }}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 대출금액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>대출금액</span>
                    <span className="tabular-nums text-primary">
                      {fmt(loanAmount)}원
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={price}
                    step={10_000_000}
                    value={loanAmountInput}
                    onChange={(e) => setLoanAmountInput(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={loanAmountInput.toLocaleString("ko-KR")}
                      onChange={(e) => {
                        const num = Number(e.target.value.replace(/[^0-9]/g, "")) || 0;
                        setLoanAmountInput(num);
                      }}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                  <div className="mt-2 rounded-lg bg-surface px-3 py-2 text-sm text-text-secondary">
                    자기자금 비율:{" "}
                    <span className="font-semibold tabular-nums text-text-primary">
                      {ownFundsRatio}%
                    </span>
                    {" "}({fmt(Math.max(price - loanAmount, 0))}원)
                  </div>
                </div>

                {/* 연이자율 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>연이자율</span>
                    <span className="tabular-nums text-primary">
                      {annualRate.toFixed(2)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={15}
                    step={0.05}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      value={annualRate}
                      onChange={(e) =>
                        setAnnualRate(
                          Math.min(15, Math.max(0.1, Number(e.target.value)))
                        )
                      }
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={0.05}
                      min={0.1}
                      max={15}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      %
                    </span>
                  </div>
                </div>

                {/* 은행 금리 프리셋 */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    시중은행 금리 (최저 ~ 최고, {interestRates.updatedAt} 기준)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {interestRates.bankRates.map((b) => (
                      <button
                        key={b.bank}
                        onClick={() =>
                          setAnnualRate(
                            Math.round(
                              ((b.minRate + b.maxRate) / 2) * 100
                            ) / 100
                          )
                        }
                        title={`${b.minRate}% ~ ${b.maxRate}%`}
                        className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                      >
                        {b.bank}{" "}
                        <span className="tabular-nums">
                          {b.minRate}~{b.maxRate}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 대출기간 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>대출기간</span>
                    <span className="tabular-nums text-primary">
                      {termYears}년
                    </span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={termYears}
                    onChange={(e) => setTermYears(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-secondary">
                    <span>1년</span>
                    <span>40년</span>
                  </div>
                </div>

                {/* 거치기간 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>거치기간</span>
                    <span className="tabular-nums text-primary">
                      {safeGrace}년
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.min(10, termYears - 1)}
                    step={1}
                    value={safeGrace}
                    onChange={(e) => setGracePeriodYears(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-secondary">
                    <span>없음</span>
                    <span>최대 {Math.min(10, termYears - 1)}년</span>
                  </div>
                </div>

                {/* 연봉 (DSR) */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>
                      연봉{" "}
                      <span className="font-normal text-text-secondary">
                        (DSR 계산용, 선택)
                      </span>
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={annualIncome || ""}
                      placeholder="예: 60000000"
                      onChange={(e) =>
                        setAnnualIncome(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={1_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>
              </div>

              {/* Ad slot (inline) */}
              <AdSlot type="inline" />

              {/* Charts */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  총 이자 비교 (상환방식별)
                </h2>
                <div className="h-60">
                  <Suspense fallback={<div className="h-60 animate-pulse rounded bg-surface" />}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonChartData}
                        margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                        />
                        <YAxis
                          tickFormatter={(v) =>
                            `${Math.round(v / 10_000_000)}천만`
                          }
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          width={52}
                        />
                        <Tooltip
                          formatter={(v: unknown) => [
                            `${fmt(Number(v))}원`,
                            "총 이자",
                          ]}
                        />
                        <Bar dataKey="totalInterest" radius={[4, 4, 0, 0]}>
                          {comparisonChartData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={comparisonColors[idx]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Suspense>
                </div>
              </div>

              {/* Stacked monthly schedule chart */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-text-primary">
                  월별 원금·이자 추이 (원리금균등)
                </h2>
                <p className="mb-4 text-xs text-text-secondary">
                  연도별 첫 달 기준으로 표시됩니다.
                </p>
                <div className="h-64">
                  <Suspense fallback={<div className="h-64 animate-pulse rounded bg-surface" />}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={scheduleChartData}
                        margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          interval={Math.floor(scheduleChartData.length / 6)}
                        />
                        <YAxis
                          tickFormatter={(v) =>
                            `${Math.round(v / 10_000)}만`
                          }
                          tick={{ fontSize: 11, fill: "#6B7280" }}
                          width={48}
                        />
                        <Tooltip
                          formatter={(v: unknown, name: unknown) => [
                            `${fmt(Number(v))}원`,
                            name === "principal" ? "원금" : "이자",
                          ]}
                        />
                        <Legend
                          formatter={(value) =>
                            value === "principal" ? "원금" : "이자"
                          }
                        />
                        <Bar
                          dataKey="interest"
                          stackId="a"
                          fill={CHART_COLORS.interest}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="principal"
                          stackId="a"
                          fill={CHART_COLORS.principal}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Suspense>
                </div>
              </div>

              {/* Guide text */}
              <GuideText title="상환 방식별 비교 가이드">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">원리금균등 상환</strong>
                    <p className="mt-0.5">
                      매월 동일한 금액을 납부합니다. 초기에는 이자 비중이
                      높고, 시간이 갈수록 원금 비중이 높아집니다. 현금흐름
                      계획이 쉬운 것이 장점입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">원금균등 상환</strong>
                    <p className="mt-0.5">
                      매월 동일한 원금을 납부하고, 이자는 잔액에 비례해
                      줄어듭니다. 초기 상환 부담이 크지만 총 이자는 원리금균등
                      대비 적습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">만기일시 상환</strong>
                    <p className="mt-0.5">
                      기간 중에는 이자만 납부하고 만기에 원금 전액을
                      상환합니다. 월 납입액이 가장 적지만 총 이자 부담이
                      가장 큽니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">DSR(총부채원리금상환비율)</strong>
                    <p className="mt-0.5">
                      연간 원리금 상환액을 연 소득으로 나눈 비율입니다. 금융당국은
                      DSR 40% 이하를 권장하며, 주요 대출 규제의 기준이 됩니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related calculators */}
              <RelatedCalculators calculatorId="loan-calculator" />
            </div>

            {/* ── Right: Results (sticky) ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Summary card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  월 상환액 (원리금균등)
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {fmt(equalPayment.monthlyPayment)}
                  <span className="ml-1 text-lg font-medium">원</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                  <div>
                    <p className="text-xs text-text-secondary">총 상환액</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {fmt(equalPayment.totalPayment)}원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">총 이자</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {fmt(equalPayment.totalInterest)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* DSR card */}
              {annualIncome > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-1 text-xs font-medium text-text-secondary">
                    DSR (총부채원리금상환비율)
                  </p>
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      dsrValue >= 40 ? "text-negative" : "text-positive"
                    }`}
                  >
                    {dsrValue.toFixed(1)}%
                  </p>
                  <p
                    className={`mt-1 text-xs font-medium ${
                      dsrValue >= 40 ? "text-negative" : "text-positive"
                    }`}
                  >
                    {dsrValue >= 40
                      ? "금융당국 권고 기준(40%) 초과"
                      : "금융당국 권고 기준(40%) 이내"}
                  </p>
                </div>
              )}

              {/* 3-way comparison table */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  상환 방식 비교
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-text-secondary">
                          방식
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          월 상환액
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          총 이자
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-2 font-medium text-text-primary">
                          원리금균등
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-primary">
                          {fmt(equalPayment.monthlyPayment)}원
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-primary">
                          {fmt(equalPayment.totalInterest)}원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-text-primary">
                          원금균등
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">
                          <div className="tabular-nums">
                            최초{" "}
                            <span className="font-medium text-text-primary">
                              {fmt(equalPrincipal.monthlyPayment)}원
                            </span>
                          </div>
                        </td>
                        <td className="py-2 text-right tabular-nums text-positive">
                          {fmt(equalPrincipal.totalInterest)}원
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium text-text-primary">
                          만기일시
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-primary">
                          {fmt(bullet.monthlyPayment)}원
                          <span className="ml-0.5 text-text-secondary">
                            (이자)
                          </span>
                        </td>
                        <td className="py-2 text-right tabular-nums text-negative">
                          {fmt(bullet.totalInterest)}원
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Savings callout */}
                <div className="mt-3 rounded-lg bg-positive-light px-3 py-2 text-xs text-positive">
                  원금균등이 원리금균등보다 이자{" "}
                  <span className="font-semibold tabular-nums">
                    {fmt(
                      Math.max(
                        0,
                        equalPayment.totalInterest -
                          equalPrincipal.totalInterest
                      )
                    )}
                    원
                  </span>{" "}
                  절약
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="주택대출 시뮬레이터 - Tooly"
                  description={`대출금 ${fmt(loanAmount)}원 / 금리 ${annualRate}% / ${termYears}년 → 월 ${fmt(equalPayment.monthlyPayment)}원`}
                />
              </div>

              {/* CTA: salary calculator */}
              {annualIncome > 0 && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-2 text-xs text-text-secondary">
                    정확한 실수령액이 궁금하다면?
                  </p>
                  <ContextCTA
                    text="연봉 실수령액 계산하기"
                    href={`/finance/salary-calculator?annual=${annualIncome}`}
                  />
                </div>
              )}

              {/* Sidebar ad */}
              <AdSlot type="sidebar" />
            </aside>
          </div>

          {/* Bottom banner ad */}
          <div className="mt-8">
            <AdSlot type="banner" />
          </div>
        </div>
      </main>

      <Footer />

      {/* JSON-LD */}
      {calculator && <JsonLd calculator={calculator} />}
    </>
  );
}

export default function LoanCalculatorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-text-secondary">로딩 중...</div>}>
      <LoanCalculatorInner />
    </Suspense>
  );
}
