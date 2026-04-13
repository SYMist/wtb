"use client";

import { useState, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  calcCompoundForward,
  calcRequiredMonthly,
  calcRequiredRate,
  type CompoundForwardInput,
} from "@/lib/calculators/compound";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import ContextCTA from "@/components/common/ContextCTA";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

// Dynamic import for recharts - SSR disabled as recharts is client-only
const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import("recharts").then((m) => m.Area), {
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

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function fmt(n: number): string {
  return Math.round(n).toLocaleString("ko-KR");
}

function fmtEok(n: number): string {
  if (Math.abs(n) >= 100_000_000) {
    const eok = n / 100_000_000;
    return `${eok.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`;
  }
  if (Math.abs(n) >= 10_000) {
    const man = n / 10_000;
    return `${man.toLocaleString("ko-KR", { maximumFractionDigits: 0 })}만`;
  }
  return fmt(n);
}

// ------------------------------------------------------------------
// Number input with slider
// ------------------------------------------------------------------
interface NumberSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  formatDisplay?: (v: number) => string;
}

function NumberSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  formatDisplay,
}: NumberSliderProps) {
  const display = formatDisplay ? formatDisplay(value) : fmt(value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="tabular-nums text-sm font-semibold text-primary">
          {display}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
      />
      <div className="flex justify-between text-xs text-text-secondary">
        <span>
          {formatDisplay ? formatDisplay(min) : fmt(min)}
          {unit}
        </span>
        <span>
          {formatDisplay ? formatDisplay(max) : fmt(max)}
          {unit}
        </span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Money input (text input with number formatting)
// ------------------------------------------------------------------
interface MoneyInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  hint?: string;
}

function MoneyInput({ label, value, onChange, placeholder, hint }: MoneyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw === "" ? 0 : Number(raw));
  };
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("ko-KR")}
          onChange={handleChange}
          placeholder={placeholder ?? "0"}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-8 text-right tabular-nums text-sm text-text-primary focus:border-primary focus:outline-none"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
          원
        </span>
      </div>
      {hint && <p className="text-xs text-text-secondary">{hint}</p>}
    </div>
  );
}

// ------------------------------------------------------------------
// Chart tooltip formatter
// ------------------------------------------------------------------
function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-sm shadow-lg">
      <p className="mb-1.5 font-semibold text-text-primary">{label}년차</p>
      {payload.map((entry) => (
        <p key={entry.name} className="tabular-nums" style={{ color: entry.color }}>
          {entry.name}: {fmt(entry.value)}원
        </p>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------
// Main calculator (inner component to allow Suspense wrapping)
// ------------------------------------------------------------------
function CompoundInterestCalculator() {
  const searchParams = useSearchParams();

  // URL param: ?monthly=xxx from salary calculator
  const monthlyFromUrl = searchParams.get("monthly");
  const initialMonthly = monthlyFromUrl ? Number(monthlyFromUrl) : 500_000;

  // ------------------------------------------------------------------
  // Mode: forward | reverse
  // ------------------------------------------------------------------
  const [mode, setMode] = useState<"forward" | "reverse">("forward");

  // ------------------------------------------------------------------
  // Forward mode state
  // ------------------------------------------------------------------
  const [initialInvestment, setInitialInvestment] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(initialMonthly);
  const [annualReturnRate, setAnnualReturnRate] = useState(7);
  const [years, setYears] = useState(20);
  const [inflationEnabled, setInflationEnabled] = useState(false);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [compareMode, setCompareMode] = useState(false);

  // ------------------------------------------------------------------
  // Reverse mode state
  // ------------------------------------------------------------------
  const [targetAmount, setTargetAmount] = useState(500_000_000);
  const [reverseYears, setReverseYears] = useState(20);
  const [reverseMode, setReverseMode] = useState<"findMonthly" | "findRate">(
    "findMonthly"
  );
  const [reverseRate, setReverseRate] = useState(7);
  const [reverseMonthly, setReverseMonthly] = useState(500_000);
  const [reverseInitial, setReverseInitial] = useState(0);

  // ------------------------------------------------------------------
  // Forward calculation
  // ------------------------------------------------------------------
  const forwardInput: CompoundForwardInput = {
    initialInvestment,
    monthlyContribution,
    annualReturnRate,
    years,
    inflationRate: inflationEnabled ? inflationRate : 0,
  };

  const forwardResult = useMemo(
    () => calcCompoundForward(forwardInput),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initialInvestment,
      monthlyContribution,
      annualReturnRate,
      years,
      inflationEnabled,
      inflationRate,
    ]
  );

  // 거치식 전용 결과 (initialInvestment만 사용, monthlyContribution=0)
  const lumpSumResult = useMemo(
    () =>
      calcCompoundForward({
        initialInvestment,
        monthlyContribution: 0,
        annualReturnRate,
        years,
        inflationRate: inflationEnabled ? inflationRate : 0,
      }),
    [initialInvestment, annualReturnRate, years, inflationEnabled, inflationRate]
  );

  // ------------------------------------------------------------------
  // Reverse calculation
  // ------------------------------------------------------------------
  const reverseResult = useMemo(() => {
    if (reverseMode === "findMonthly") {
      return {
        requiredMonthly: calcRequiredMonthly(
          targetAmount,
          reverseYears,
          reverseRate,
          reverseInitial
        ),
      };
    } else {
      return {
        requiredRate: calcRequiredRate(
          targetAmount,
          reverseYears,
          reverseMonthly,
          reverseInitial
        ),
      };
    }
  }, [
    reverseMode,
    targetAmount,
    reverseYears,
    reverseRate,
    reverseMonthly,
    reverseInitial,
  ]);

  // ------------------------------------------------------------------
  // Chart data
  // ------------------------------------------------------------------
  const chartData = useMemo(() => {
    return forwardResult.yearlyData.map((d) => {
      const row: Record<string, number> = {
        year: d.year,
        totalInvested: d.totalInvested,
        totalValue: d.totalValue,
      };
      if (inflationEnabled && d.realValue !== undefined) {
        row.realValue = d.realValue;
      }
      if (compareMode) {
        const lumpYear = lumpSumResult.yearlyData.find((l) => l.year === d.year);
        if (lumpYear) row.lumpSumValue = lumpYear.totalValue;
      }
      return row;
    });
  }, [forwardResult, lumpSumResult, inflationEnabled, compareMode]);

  const calculator = getCalculator("compound-interest")!;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <>
      <JsonLd calculator={calculator} />
      <GNB />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-2 text-2xl font-bold text-text-primary">
          {calculator.seo.h1}
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          적립식·거치식 비교, 인플레이션 반영 실질 수익 확인
        </p>

        <AdSlot type="banner" />

        {/* Mode tabs */}
        <div className="mt-6 flex gap-1 rounded-xl bg-surface p-1">
          <button
            onClick={() => setMode("forward")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              mode === "forward"
                ? "bg-background text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            얼마를 모을 수 있나
          </button>
          <button
            onClick={() => setMode("reverse")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              mode === "reverse"
                ? "bg-background text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            목표까지 얼마가 필요한가
          </button>
        </div>

        {/* Desktop: side-by-side, Mobile: stacked */}
        <div className="mt-4 flex flex-col gap-6 lg:flex-row">
          {/* ==================== INPUT PANEL ==================== */}
          <div className="w-full space-y-5 lg:w-1/2">
            {mode === "forward" ? (
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-text-primary">
                  투자 정보 입력
                </h2>

                <div className="space-y-6">
                  {/* 초기 투자금 */}
                  <div className="space-y-2">
                    <MoneyInput
                      label="초기 투자금"
                      value={initialInvestment}
                      onChange={setInitialInvestment}
                      placeholder="0"
                      hint="거치식 비교 시 이 금액을 기준으로 합니다"
                    />
                    <input
                      type="range"
                      min={0}
                      max={1_000_000_000}
                      step={10_000_000}
                      value={initialInvestment}
                      onChange={(e) => setInitialInvestment(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>0원</span>
                      <span>10억원</span>
                    </div>
                  </div>

                  {/* 월 적립액 */}
                  <div className="space-y-2">
                    <MoneyInput
                      label="월 적립액"
                      value={monthlyContribution}
                      onChange={setMonthlyContribution}
                      placeholder="500,000"
                    />
                    <input
                      type="range"
                      min={0}
                      max={10_000_000}
                      step={50_000}
                      value={monthlyContribution}
                      onChange={(e) =>
                        setMonthlyContribution(Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>0원</span>
                      <span>1,000만원</span>
                    </div>
                  </div>

                  {/* 연 수익률 */}
                  <NumberSlider
                    label="연 수익률"
                    value={annualReturnRate}
                    onChange={setAnnualReturnRate}
                    min={0}
                    max={30}
                    step={0.1}
                    unit="%"
                    formatDisplay={(v) => v.toFixed(1)}
                  />

                  {/* 투자 기간 */}
                  <NumberSlider
                    label="투자 기간"
                    value={years}
                    onChange={setYears}
                    min={1}
                    max={50}
                    unit="년"
                  />

                  {/* 인플레이션 */}
                  <div className="space-y-3 rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-text-primary">
                        인플레이션 반영
                      </label>
                      <button
                        role="switch"
                        aria-checked={inflationEnabled}
                        onClick={() => setInflationEnabled(!inflationEnabled)}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          inflationEnabled ? "bg-primary" : "bg-border"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            inflationEnabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                    {inflationEnabled && (
                      <NumberSlider
                        label="연 물가상승률"
                        value={inflationRate}
                        onChange={setInflationRate}
                        min={0}
                        max={10}
                        step={0.1}
                        unit="%"
                        formatDisplay={(v) => v.toFixed(1)}
                      />
                    )}
                  </div>

                  {/* 적립식/거치식 비교 */}
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        적립식/거치식 비교
                      </p>
                      <p className="text-xs text-text-secondary">
                        초기 투자금으로 거치식 운용 시 결과와 비교합니다
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={compareMode}
                      onClick={() => setCompareMode(!compareMode)}
                      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                        compareMode ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          compareMode ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // ==================== REVERSE MODE INPUTS ====================
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-text-primary">
                  목표 금액 역산
                </h2>

                <div className="space-y-6">
                  {/* 목표 금액 */}
                  <div className="space-y-2">
                    <MoneyInput
                      label="목표 금액"
                      value={targetAmount}
                      onChange={setTargetAmount}
                      placeholder="500,000,000"
                      hint="달성하고 싶은 최종 금액을 입력하세요"
                    />
                    <input
                      type="range"
                      min={10_000_000}
                      max={2_000_000_000}
                      step={10_000_000}
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-secondary">
                      <span>1,000만원</span>
                      <span>20억원</span>
                    </div>
                  </div>

                  {/* 초기 투자금 */}
                  <div className="space-y-2">
                    <MoneyInput
                      label="초기 투자금 (선택)"
                      value={reverseInitial}
                      onChange={setReverseInitial}
                      placeholder="0"
                    />
                  </div>

                  {/* 투자 기간 */}
                  <NumberSlider
                    label="투자 기간"
                    value={reverseYears}
                    onChange={setReverseYears}
                    min={1}
                    max={50}
                    unit="년"
                  />

                  {/* 역산 방향 선택 */}
                  <div>
                    <p className="mb-2 text-sm font-medium text-text-primary">
                      무엇을 계산할까요?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setReverseMode("findMonthly")}
                        className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                          reverseMode === "findMonthly"
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        필요한 월 적립액
                      </button>
                      <button
                        onClick={() => setReverseMode("findRate")}
                        className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                          reverseMode === "findRate"
                            ? "border-primary bg-primary-light text-primary"
                            : "border-border text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        필요한 수익률
                      </button>
                    </div>
                  </div>

                  {/* 알려진 값 입력 */}
                  {reverseMode === "findMonthly" ? (
                    <NumberSlider
                      label="연 수익률 (가정)"
                      value={reverseRate}
                      onChange={setReverseRate}
                      min={0}
                      max={30}
                      step={0.1}
                      unit="%"
                      formatDisplay={(v) => v.toFixed(1)}
                    />
                  ) : (
                    <div className="space-y-2">
                      <MoneyInput
                        label="월 적립액 (가정)"
                        value={reverseMonthly}
                        onChange={setReverseMonthly}
                        placeholder="500,000"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ==================== RESULT PANEL ==================== */}
          <div className="w-full lg:w-1/2">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              {mode === "forward" ? (
                <div className="space-y-4">
                  {/* Summary card */}
                  <div className="rounded-xl border border-primary bg-primary-light p-5">
                    <p className="text-sm font-medium text-primary">
                      {years}년 후 최종 금액
                    </p>
                    <p className="mt-1 tabular-nums text-3xl font-bold text-primary">
                      {fmt(forwardResult.finalAmount)}원
                    </p>
                    {inflationEnabled && (
                      <p className="mt-1 tabular-nums text-sm text-primary opacity-70">
                        실질 가치:{" "}
                        {fmt(
                          forwardResult.yearlyData[
                            forwardResult.yearlyData.length - 1
                          ]?.realValue ?? 0
                        )}
                        원
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-white/60 p-3 text-center">
                        <p className="text-xs text-primary opacity-70">
                          총 투자 원금
                        </p>
                        <p className="tabular-nums text-sm font-semibold text-primary">
                          {fmtEok(forwardResult.totalInvested)}원
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/60 p-3 text-center">
                        <p className="text-xs text-primary opacity-70">
                          총 수익
                        </p>
                        <p className="tabular-nums text-sm font-semibold text-primary">
                          {fmtEok(forwardResult.totalEarnings)}원
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/60 p-3 text-center">
                        <p className="text-xs text-primary opacity-70">
                          수익률
                        </p>
                        <p className="tabular-nums text-sm font-semibold text-primary">
                          {forwardResult.returnRate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 거치식 비교 테이블 */}
                  {compareMode && initialInvestment > 0 && (
                    <div className="overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-surface">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-secondary"></th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                              적립식
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                              거치식
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          <tr>
                            <td className="px-4 py-3 text-text-secondary">
                              최종 금액
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right font-semibold text-text-primary">
                              {fmt(forwardResult.finalAmount)}원
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right font-semibold text-text-primary">
                              {fmt(lumpSumResult.finalAmount)}원
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-text-secondary">
                              총 수익
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right text-positive">
                              {fmt(forwardResult.totalEarnings)}원
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right text-positive">
                              {fmt(lumpSumResult.totalEarnings)}원
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-text-secondary">
                              수익률
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right text-positive">
                              {forwardResult.returnRate.toFixed(1)}%
                            </td>
                            <td className="tabular-nums px-4 py-3 text-right text-positive">
                              {lumpSumResult.returnRate.toFixed(1)}%
                            </td>
                          </tr>
                          {inflationEnabled && (
                            <tr>
                              <td className="px-4 py-3 text-text-secondary">
                                실질 금액
                              </td>
                              <td className="tabular-nums px-4 py-3 text-right text-text-secondary">
                                {fmt(
                                  forwardResult.yearlyData[
                                    forwardResult.yearlyData.length - 1
                                  ]?.realValue ?? 0
                                )}
                                원
                              </td>
                              <td className="tabular-nums px-4 py-3 text-right text-text-secondary">
                                {fmt(
                                  lumpSumResult.yearlyData[
                                    lumpSumResult.yearlyData.length - 1
                                  ]?.realValue ?? 0
                                )}
                                원
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Chart */}
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="mb-4 text-sm font-semibold text-text-primary">
                      자산 성장 추이
                    </h3>
                    <div className="h-56">
                      <Suspense
                        fallback={
                          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                            차트 로딩 중...
                          </div>
                        }
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={chartData}
                            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                            />
                            <XAxis
                              dataKey="year"
                              tick={{ fontSize: 11, fill: "#6B7280" }}
                              tickFormatter={(v: number) => `${v}년`}
                            />
                            <YAxis
                              tick={{ fontSize: 11, fill: "#6B7280" }}
                              tickFormatter={(v: number) => fmtEok(v)}
                              width={60}
                            />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend
                              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                            />
                            <Area
                              type="monotone"
                              dataKey="totalInvested"
                              name="투자 원금"
                              stackId="1"
                              stroke="#9CA3AF"
                              fill="#F3F4F6"
                              strokeWidth={1.5}
                            />
                            <Area
                              type="monotone"
                              dataKey="totalValue"
                              name="총 자산 (적립식)"
                              stackId="2"
                              stroke="#2563EB"
                              fill="#DBEAFE"
                              strokeWidth={2}
                            />
                            {compareMode && initialInvestment > 0 && (
                              <Area
                                type="monotone"
                                dataKey="lumpSumValue"
                                name="총 자산 (거치식)"
                                stackId="3"
                                stroke="#7C3AED"
                                fill="transparent"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            )}
                            {inflationEnabled && (
                              <Area
                                type="monotone"
                                dataKey="realValue"
                                name="실질 가치"
                                stackId="4"
                                stroke="#DC2626"
                                fill="transparent"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                              />
                            )}
                          </AreaChart>
                        </ResponsiveContainer>
                      </Suspense>
                    </div>
                  </div>

                  {/* Year-by-year table */}
                  <div className="rounded-xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-surface">
                            <th className="px-3 py-3 text-center text-xs font-semibold text-text-secondary">
                              연도
                            </th>
                            <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary">
                              총 원금
                            </th>
                            <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary">
                              총 자산
                            </th>
                            <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary">
                              수익
                            </th>
                            {inflationEnabled && (
                              <th className="px-3 py-3 text-right text-xs font-semibold text-text-secondary">
                                실질 가치
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {forwardResult.yearlyData.map((row) => (
                            <tr key={row.year} className="hover:bg-surface">
                              <td className="tabular-nums px-3 py-2.5 text-center text-text-secondary">
                                {row.year}년
                              </td>
                              <td className="tabular-nums px-3 py-2.5 text-right text-text-primary">
                                {fmtEok(row.totalInvested)}원
                              </td>
                              <td className="tabular-nums px-3 py-2.5 text-right font-medium text-text-primary">
                                {fmtEok(row.totalValue)}원
                              </td>
                              <td className="tabular-nums px-3 py-2.5 text-right text-positive">
                                +{fmtEok(row.earnings)}원
                              </td>
                              {inflationEnabled && (
                                <td className="tabular-nums px-3 py-2.5 text-right text-text-secondary">
                                  {row.realValue !== undefined
                                    ? `${fmtEok(row.realValue)}원`
                                    : "-"}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        이 금액으로 내 집 마련 가능할까?
                      </p>
                      <p className="text-xs text-text-secondary">
                        주택대출 시뮬레이터로 확인해보세요
                      </p>
                    </div>
                    <ContextCTA
                      text="대출 계산기 바로가기"
                      href={`/finance/loan-calculator?price=${forwardResult.finalAmount}`}
                    />
                  </div>

                  {/* Share */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">결과 공유하기</p>
                    <ShareButton
                      title="투자 복리 계산기 - Tooly"
                      description={`${years}년 후 ${fmt(forwardResult.finalAmount)}원 달성 예상`}
                    />
                  </div>
                </div>
              ) : (
                // ==================== REVERSE RESULT ====================
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary bg-primary-light p-5">
                    <p className="text-sm font-medium text-primary">
                      {reverseYears}년 후 {fmt(targetAmount)}원 달성을 위해
                    </p>

                    {reverseMode === "findMonthly" ? (
                      <>
                        <p className="mt-2 text-xs text-primary opacity-70">
                          연 수익률 {reverseRate}% 가정 시
                        </p>
                        <p className="mt-1 tabular-nums text-3xl font-bold text-primary">
                          월{" "}
                          {fmt(reverseResult.requiredMonthly ?? 0)}원
                        </p>
                        <p className="mt-1 text-xs text-primary opacity-70">
                          씩 적립이 필요합니다
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mt-2 text-xs text-primary opacity-70">
                          월 {fmt(reverseMonthly)}원 적립 가정 시
                        </p>
                        <p className="mt-1 tabular-nums text-3xl font-bold text-primary">
                          연 수익률 {(reverseResult.requiredRate ?? 0).toFixed(2)}%
                        </p>
                        <p className="mt-1 text-xs text-primary opacity-70">
                          이상의 수익률이 필요합니다
                        </p>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-4 text-sm text-text-secondary">
                    <p className="font-medium text-text-primary">계산 조건</p>
                    <ul className="mt-2 space-y-1">
                      <li>목표 금액: {fmt(targetAmount)}원</li>
                      <li>투자 기간: {reverseYears}년</li>
                      {reverseInitial > 0 && (
                        <li>초기 투자금: {fmt(reverseInitial)}원</li>
                      )}
                      {reverseMode === "findMonthly" ? (
                        <li>가정 수익률: 연 {reverseRate}%</li>
                      ) : (
                        <li>가정 월 적립액: {fmt(reverseMonthly)}원</li>
                      )}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-4">
                    <p className="text-sm text-text-secondary">
                      정방향으로 복리 성장 그래프를 확인하려면 &quot;얼마를 모을 수 있나&quot; 탭을 이용하세요.
                    </p>
                  </div>

                  {/* Share */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-secondary">결과 공유하기</p>
                    <ShareButton
                      title="투자 복리 계산기 - Tooly"
                      description={`${reverseYears}년 후 ${fmt(targetAmount)}원 달성 계획`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AdSlot type="inline" className="mt-8" />

        {/* Guide */}
        <div className="mt-8">
          <GuideText title="복리 계산기 이용 가이드">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-text-primary">복리(複利)란?</p>
                <p className="mt-1">
                  원금에 붙은 이자가 다시 원금에 합산되어 다음 기간의 이자를 계산하는 방식입니다. 단리와 달리 시간이 지날수록 이자가 기하급수적으로 증가합니다. 워렌 버핏이 복리를 &quot;세상에서 8번째 불가사의&quot;라고 표현한 이유입니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">적립식 vs 거치식</p>
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  <li><strong>적립식:</strong> 초기 투자 후 매월 일정 금액을 추가 투자하는 방식. 월급의 일부를 꾸준히 투자하는 직장인에게 적합합니다.</li>
                  <li><strong>거치식:</strong> 초기에 목돈을 투자한 후 추가 투자 없이 운용하는 방식. 목돈이 있을 때 한 번에 투자합니다.</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-text-primary">인플레이션 반영이란?</p>
                <p className="mt-1">
                  명목 수익금에서 물가상승분을 제거한 실질 구매력 기준의 자산 가치를 보여줍니다. 예를 들어 연 2.5% 인플레이션 가정 시, 20년 후 1억원의 실질 가치는 약 6,100만원에 불과합니다.
                </p>
              </div>
              <div>
                <p className="font-semibold text-text-primary">수익률 기준</p>
                <p className="mt-1">
                  국내 주식(코스피) 장기 평균 수익률은 약 6~8%, 글로벌 지수(S&amp;P 500) 장기 평균은 약 10% 수준입니다. 이 계산기는 세금 및 수수료를 반영하지 않으므로, 실제 투자 시에는 이를 감안해야 합니다.
                </p>
              </div>
            </div>
          </GuideText>
        </div>

        {/* Related */}
        <div className="mt-8">
          <RelatedCalculators calculatorId="compound-interest" />
        </div>
      </main>
      <Footer />
    </>
  );
}

// ------------------------------------------------------------------
// Page export with Suspense boundary (required for useSearchParams)
// ------------------------------------------------------------------
export default function CompoundInterestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-text-secondary">로딩 중...</div>
        </div>
      }
    >
      <CompoundInterestCalculator />
    </Suspense>
  );
}
