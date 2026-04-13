"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import ContextCTA from "@/components/common/ContextCTA";
import JsonLd from "@/components/common/JsonLd";
import { calculateSalary, getSalaryComparison } from "@/lib/calculators/salary";
import { getCalculator } from "@/lib/data/calculators";

// Dynamic imports for recharts to enable code splitting
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), {
  ssr: false,
});
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

const DEDUCTION_COLORS = [
  "#EF4444", // 국민연금 - red
  "#F97316", // 건강보험 - orange
  "#EAB308", // 장기요양보험 - yellow
  "#8B5CF6", // 고용보험 - violet
  "#EC4899", // 소득세 - pink
  "#06B6D4", // 지방소득세 - cyan
];

const PIE_COLORS = ["#2563EB", ...DEDUCTION_COLORS];

function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR");
}

function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

interface Props {
  initialAnnual: number;
  initialDependents: number;
  initialChildren: number;
  initialNonTaxable: number;
}

export default function SalaryCalculatorClient({
  initialAnnual,
  initialDependents,
  initialChildren,
  initialNonTaxable,
}: Props) {
  const calculator = getCalculator("salary-calculator");

  const [annualSalary, setAnnualSalary] = useState(initialAnnual);
  const [annualInputText, setAnnualInputText] = useState(
    formatNumber(initialAnnual)
  );
  const [inputMode, setInputMode] = useState<"annual" | "monthly">("annual");
  const [monthlyInputText, setMonthlyInputText] = useState(
    formatNumber(Math.round(initialAnnual / 12))
  );
  const [nonTaxableAmount, setNonTaxableAmount] = useState(initialNonTaxable);
  const [nonTaxableInputText, setNonTaxableInputText] = useState(
    formatNumber(initialNonTaxable)
  );
  const [dependents, setDependents] = useState(initialDependents);
  const [children, setChildren] = useState(initialChildren);

  const result = useMemo(
    () =>
      calculateSalary({
        annualSalary,
        nonTaxableAmount,
        dependents,
        children,
      }),
    [annualSalary, nonTaxableAmount, dependents, children]
  );

  const comparisonData = useMemo(
    () =>
      getSalaryComparison(annualSalary, {
        nonTaxableAmount,
        dependents,
        children,
      }),
    [annualSalary, nonTaxableAmount, dependents, children]
  );

  const pieData = useMemo(() => {
    const items = [
      { name: "실수령액", value: result.monthlyTakeHome },
      ...result.deductions.map((d) => ({ name: d.name, value: d.monthly })),
    ];
    return items;
  }, [result]);

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(e.target.value);
    setAnnualSalary(value);
    setAnnualInputText(formatNumber(value));
    setMonthlyInputText(formatNumber(Math.round(value / 12)));
  }

  function handleAnnualInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAnnualInputText(raw ? Number(raw).toLocaleString("ko-KR") : "");
    if (raw) {
      const val = Math.min(Math.max(Number(raw), 20_000_000), 200_000_000);
      setAnnualSalary(val);
      setMonthlyInputText(formatNumber(Math.round(val / 12)));
    }
  }

  function handleAnnualInputBlur() {
    setAnnualInputText(formatNumber(annualSalary));
  }

  function handleMonthlyInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setMonthlyInputText(raw ? Number(raw).toLocaleString("ko-KR") : "");
    if (raw) {
      const monthly = Number(raw);
      const annual = Math.min(
        Math.max(monthly * 12, 20_000_000),
        200_000_000
      );
      setAnnualSalary(annual);
      setAnnualInputText(formatNumber(annual));
    }
  }

  function handleMonthlyInputBlur() {
    setMonthlyInputText(formatNumber(Math.round(annualSalary / 12)));
  }

  function handleNonTaxableChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setNonTaxableInputText(raw ? Number(raw).toLocaleString("ko-KR") : "");
    if (raw) {
      setNonTaxableAmount(Number(raw));
    } else {
      setNonTaxableAmount(0);
    }
  }

  function handleNonTaxableBlur() {
    setNonTaxableInputText(formatNumber(nonTaxableAmount));
  }

  // Slider fill percentage
  const sliderPercent =
    ((annualSalary - 20_000_000) / (200_000_000 - 20_000_000)) * 100;

  return (
    <>
      <GNB />
      {calculator && <JsonLd calculator={calculator} />}
      <main className="flex-1">
        {/* Top banner ad */}
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <AdSlot type="banner" />
        </div>

        {/* Page header */}
        <div className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            연봉 실수령액 계산기
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            2026년 4대보험·소득세 기준 | 월 실수령액을 바로 확인하세요
          </p>
        </div>

        {/* Main content: left-right split layout */}
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="lg:flex lg:gap-8 lg:items-start">
            {/* Left: inputs (scrolls naturally) */}
            <div className="lg:flex-1 space-y-6">
              {/* Input card */}
              <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-semibold text-text-primary">
                  급여 정보 입력
                </h2>

                {/* Input mode toggle */}
                <div className="mb-5">
                  <div className="inline-flex rounded-lg border border-border p-0.5">
                    <button
                      onClick={() => setInputMode("annual")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                        inputMode === "annual"
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      연봉 입력
                    </button>
                    <button
                      onClick={() => setInputMode("monthly")}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors min-h-[44px] ${
                        inputMode === "monthly"
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      월급 입력
                    </button>
                  </div>
                </div>

                {/* Annual salary input */}
                {inputMode === "annual" && (
                  <div className="mb-5">
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      연봉
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={annualInputText}
                        onChange={handleAnnualInputChange}
                        onBlur={handleAnnualInputBlur}
                        className="tabular-nums w-full rounded-lg border border-border px-4 py-3 pr-8 text-right text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                        placeholder="40,000,000"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        원
                      </span>
                    </div>
                  </div>
                )}

                {/* Monthly salary input */}
                {inputMode === "monthly" && (
                  <div className="mb-5">
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      월 기본급
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={monthlyInputText}
                        onChange={handleMonthlyInputChange}
                        onBlur={handleMonthlyInputBlur}
                        className="tabular-nums w-full rounded-lg border border-border px-4 py-3 pr-8 text-right text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                        placeholder="3,333,333"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                        원
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary tabular-nums">
                      환산 연봉: {formatWon(annualSalary)}
                    </p>
                  </div>
                )}

                {/* Slider */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-text-secondary">2,000만원</span>
                    <span className="text-xs font-medium tabular-nums text-primary">
                      {formatWon(annualSalary)}
                    </span>
                    <span className="text-xs text-text-secondary">2억원</span>
                  </div>
                  <div className="relative">
                    <div className="relative h-2 rounded-full bg-border">
                      <div
                        className="absolute left-0 top-0 h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${sliderPercent}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min={20_000_000}
                      max={200_000_000}
                      step={1_000_000}
                      value={annualSalary}
                      onChange={handleSliderChange}
                      className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
                    />
                  </div>
                </div>

                {/* Non-taxable amount */}
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">
                    비과세 금액{" "}
                    <span className="font-normal text-text-secondary">
                      (식대·교통비 등)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nonTaxableInputText}
                      onChange={handleNonTaxableChange}
                      onBlur={handleNonTaxableBlur}
                      className="tabular-nums w-full rounded-lg border border-border px-4 py-3 pr-8 text-right text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                      placeholder="0"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    월 식대 200,000원 등 비과세 항목을 입력하면 더 정확합니다
                  </p>
                </div>

                {/* Dependents & children */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      부양가족 수{" "}
                      <span className="font-normal text-text-secondary">
                        (본인 포함)
                      </span>
                    </label>
                    <select
                      value={dependents}
                      onChange={(e) => setDependents(Number(e.target.value))}
                      className="w-full rounded-lg border border-border px-3 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] bg-background"
                    >
                      {Array.from({ length: 11 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}명
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">
                      20세 이하 자녀
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full rounded-lg border border-border px-3 py-3 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px] bg-background"
                    >
                      {Array.from({ length: 8 }, (_, i) => i).map((n) => (
                        <option key={n} value={n}>
                          {n}명
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inline ad (mobile only) */}
              <div className="lg:hidden">
                <AdSlot type="inline" />
              </div>

              {/* Pie chart */}
              <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  월급 구성 비율
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: unknown) => [
                          formatWon(Number(value)),
                          "",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            PIE_COLORS[index % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-text-secondary truncate">
                        {item.name}
                      </span>
                      <span className="tabular-nums ml-auto text-xs font-medium text-text-primary">
                        {((item.value / result.monthlySalary) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar chart: salary comparison */}
              <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-text-primary">
                  연봉 구간별 실수령액 비교
                </h2>
                <p className="mb-4 text-xs text-text-secondary">
                  ±2,000만원 범위 비교
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={comparisonData}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="salary"
                        tickFormatter={(v: number) =>
                          `${(v / 10_000_000).toFixed(0)}천만`
                        }
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                      />
                      <YAxis
                        tickFormatter={(v: number) =>
                          `${Math.round(v / 10_000).toFixed(0)}만`
                        }
                        tick={{ fontSize: 11, fill: "#6B7280" }}
                        width={40}
                      />
                      <Tooltip
                        formatter={(value: unknown) => [
                          formatWon(Number(value)),
                          "월 실수령액",
                        ]}
                        labelFormatter={(label: unknown) =>
                          `연봉 ${formatWon(Number(label))}`
                        }
                      />
                      <Bar dataKey="takeHome" radius={[4, 4, 0, 0]}>
                        {comparisonData.map((entry, index) => (
                          <Cell
                            key={`bar-cell-${index}`}
                            fill={entry.isCurrent ? "#2563EB" : "#DBEAFE"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="mb-3 text-sm font-medium text-text-primary">
                  이 연봉으로 더 계산해보세요
                </p>
                <div className="flex flex-wrap gap-3">
                  <ContextCTA
                    text="이 연봉으로 대출 가능한 금액이 궁금하다면?"
                    href={`/finance/loan-calculator?annual=${annualSalary}`}
                  />
                  <ContextCTA
                    text="실수령액에서 매월 투자 가능한 금액은?"
                    href={`/finance/compound-interest?monthly=${result.monthlyTakeHome}`}
                  />
                </div>
              </div>

              {/* Guide text */}
              <GuideText title="4대보험 및 소득세 계산 안내">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-text-primary">
                      2026년 4대보험 공제율 (근로자 부담분)
                    </p>
                    <ul className="mt-1.5 space-y-1 text-text-secondary">
                      <li>
                        · 국민연금: 4.5% (상한 월 617만원, 하한 월 37만원)
                      </li>
                      <li>· 건강보험: 3.545%</li>
                      <li>· 장기요양보험: 건강보험료의 12.95%</li>
                      <li>· 고용보험: 0.9%</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">소득세 계산</p>
                    <p className="mt-1 text-text-secondary">
                      소득세는 누진세율 구조로, 과세표준에 따라 6%~45%가
                      적용됩니다. 부양가족 인적공제(연 150만원/인)와 자녀
                      세액공제가 반영됩니다. 지방소득세는 소득세의 10%입니다.
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      비과세 항목 안내
                    </p>
                    <p className="mt-1 text-text-secondary">
                      식대(월 20만원 이하), 자가운전보조금(월 20만원 이하),
                      육아수당(월 20만원 이하) 등은 비과세 항목으로 공제
                      대상에서 제외됩니다.
                    </p>
                  </div>
                  <p className="text-xs text-text-secondary border-t border-border pt-2">
                    ※ 본 계산기는 참고용이며, 실제 공제액은 회사 규정 및 개인
                    상황에 따라 다를 수 있습니다.
                  </p>
                </div>
              </GuideText>

              {/* Related calculators */}
              <RelatedCalculators calculatorId="salary-calculator" />

              {/* Share */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  결과 공유하기
                </span>
                <ShareButton title="연봉 실수령액 계산기" />
              </div>
            </div>

            {/* Right: sticky results panel */}
            <div className="mt-6 lg:mt-0 lg:w-80 xl:w-96 lg:sticky lg:top-20 space-y-4">
              {/* Monthly take-home highlight card */}
              <div className="rounded-xl bg-primary p-6 text-white shadow-md">
                <p className="text-sm font-medium text-primary-light/80">
                  2026년 월 실수령액
                </p>
                <p className="tabular-nums mt-1 text-4xl font-bold tracking-tight">
                  {formatNumber(result.monthlyTakeHome)}
                  <span className="ml-1 text-2xl font-normal">원</span>
                </p>
                <div className="mt-4 border-t border-white/20 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-light/70">세전 월급</span>
                    <span className="tabular-nums font-medium">
                      {formatWon(result.monthlySalary)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex justify-between text-sm">
                    <span className="text-primary-light/70">월 총 공제액</span>
                    <span className="tabular-nums font-medium text-red-300">
                      −{formatWon(result.totalDeductionMonthly)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions table */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-text-primary">
                  월 공제 항목 상세
                </h2>
                <div className="space-y-0 divide-y divide-border">
                  {result.deductions.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              DEDUCTION_COLORS[index % DEDUCTION_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-text-primary">
                          {item.name}
                        </span>
                        <span className="tabular-nums text-xs text-text-secondary">
                          ({item.rate.toFixed(2)}%)
                        </span>
                      </div>
                      <span className="tabular-nums text-sm font-medium text-text-primary">
                        {formatWon(item.monthly)}
                      </span>
                    </div>
                  ))}
                  {/* Total row */}
                  <div className="flex items-center justify-between pt-3 pb-1">
                    <span className="text-sm font-semibold text-text-primary">
                      합계
                    </span>
                    <span className="tabular-nums text-sm font-semibold text-negative">
                      {formatWon(result.totalDeductionMonthly)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Annual summary */}
              <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-text-primary">
                  연간 요약
                </h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">세전 연봉</span>
                    <span className="tabular-nums text-sm font-medium text-text-primary">
                      {formatWon(annualSalary)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">
                      연간 총 공제액
                    </span>
                    <span className="tabular-nums text-sm font-medium text-negative">
                      −{formatWon(result.totalDeductionAnnual)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2.5">
                    <span className="text-sm font-semibold text-text-primary">
                      연 실수령액
                    </span>
                    <span className="tabular-nums text-sm font-bold text-positive">
                      {formatWon(result.annualTakeHome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-secondary">
                      실수령률
                    </span>
                    <span className="tabular-nums text-sm font-medium text-text-primary">
                      {((result.annualTakeHome / annualSalary) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Annual deduction breakdown */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-text-primary">
                  연간 공제 항목 상세
                </h2>
                <div className="space-y-0 divide-y divide-border">
                  {result.deductions.map((item) => (
                    <div
                      key={`annual-${item.name}`}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-xs text-text-secondary">
                        {item.name}
                      </span>
                      <span className="tabular-nums text-xs font-medium text-text-primary">
                        {formatWon(item.annual)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2.5 pb-1">
                    <span className="text-xs font-semibold text-text-primary">
                      연간 합계
                    </span>
                    <span className="tabular-nums text-xs font-semibold text-negative">
                      {formatWon(result.totalDeductionAnnual)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar ad */}
              <AdSlot type="sidebar" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
