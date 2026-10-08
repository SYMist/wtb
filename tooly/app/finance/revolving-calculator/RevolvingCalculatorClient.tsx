"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdSlot from "@/components/common/AdSlot";
import Footer from "@/components/common/Footer";
import GNB from "@/components/common/GNB";
import GuideText from "@/components/common/GuideText";
import JsonLd from "@/components/common/JsonLd";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import { createCooldownTracker, trackEvent } from "@/lib/analytics";
import {
  calculateRevolving,
  summarizeRevolvingByYear,
  type RevolvingInput,
  type RevolvingResult,
} from "@/lib/calculators/revolving";
import { getCalculator } from "@/lib/data/calculators";

const fmtWon = (value: number) => `${Math.round(value).toLocaleString("ko-KR")}원`;
const fmtPercent = (value: number) =>
  `${Number(value.toFixed(2)).toString()}%`;

export interface RevolvingCalculatorClientProps {
  initialRolloverPrincipal: number;
  initialAnnualFeeRatePercent: number;
  initialPaymentRatePercent: number;
  initialMonthlyNewPurchases: number;
  initialMonths: number;
}

function NumberInput({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  help,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  help?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-medium text-text-primary"
      >
        <span>{label}</span>
        <span className="tabular-nums text-primary">
          {unit === "원" ? fmtWon(value) : fmtPercent(value)}
        </span>
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode={step < 1 ? "decimal" : "numeric"}
          min={min}
          max={max}
          step={step}
          value={value}
          aria-describedby={help ? `${id}-help` : undefined}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber;
            onChange(Number.isFinite(next) ? Math.min(max, Math.max(min, next)) : min);
          }}
          className="w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2.5 text-base tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="shrink-0 text-sm text-text-secondary">{unit}</span>
      </div>
      {help && (
        <p id={`${id}-help`} className="mt-1 text-xs leading-relaxed text-text-secondary">
          {help}
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
  detail,
}: {
  label: string;
  value: string;
  tone?: "default" | "primary";
  detail?: string;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-4 ${
        tone === "primary"
          ? "border-primary/30 bg-primary-light"
          : "border-border bg-background"
      }`}
    >
      <p className="text-xs font-medium text-text-secondary">{label}</p>
      <p className="mt-1 break-words text-xl font-bold tabular-nums text-text-primary sm:text-2xl">
        {value}
      </p>
      {detail && <p className="mt-1 text-xs leading-relaxed text-text-secondary">{detail}</p>}
    </div>
  );
}

function ScenarioCard({
  title,
  subtitle,
  result,
  interestDifference,
}: {
  title: string;
  subtitle: string;
  result: RevolvingResult;
  interestDifference?: number;
}) {
  return (
    <article className="rounded-xl border border-border bg-background p-4">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 min-h-10 text-xs leading-relaxed text-text-secondary">{subtitle}</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-secondary">누적 수수료</dt>
          <dd className="text-right font-semibold tabular-nums text-text-primary">{fmtWon(result.totalFee)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-secondary">총 납부액</dt>
          <dd className="text-right font-semibold tabular-nums text-text-primary">{fmtWon(result.totalPayment)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-secondary">기말 이월 원금</dt>
          <dd className="text-right font-semibold tabular-nums text-text-primary">{fmtWon(result.endingPrincipal)}</dd>
        </div>
        {interestDifference !== undefined && (
          <div className="flex justify-between gap-3 border-t border-border pt-2">
            <dt className="text-text-secondary">기준 대비 수수료</dt>
            <dd className="text-right font-semibold tabular-nums text-text-primary">
              {interestDifference > 0 ? "+" : interestDifference < 0 ? "−" : ""}
              {fmtWon(Math.abs(interestDifference))}
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

export default function RevolvingCalculatorClient({
  initialRolloverPrincipal,
  initialAnnualFeeRatePercent,
  initialPaymentRatePercent,
  initialMonthlyNewPurchases,
  initialMonths,
}: RevolvingCalculatorClientProps) {
  const [rolloverBalance, setRolloverBalance] = useState(initialRolloverPrincipal);
  const [annualFeeRate, setAnnualFeeRate] = useState(initialAnnualFeeRatePercent);
  const [paymentRate, setPaymentRate] = useState(initialPaymentRatePercent);
  const [monthlyPurchases, setMonthlyPurchases] = useState(initialMonthlyNewPurchases);
  const [months, setMonths] = useState(initialMonths);
  const input: RevolvingInput = {
    initialRolloverPrincipal: rolloverBalance,
    annualFeeRatePercent: annualFeeRate,
    paymentRatePercent: paymentRate,
    monthlyNewPurchases: monthlyPurchases,
    months,
  };
  const result = calculateRevolving(input);
  const yearly = summarizeRevolvingByYear(result);
  const calculator = getCalculator("revolving-calculator");

  const submitTracker = useMemo(
    () =>
      createCooldownTracker(() =>
        trackEvent("revolving_calculation_submit", {
          page: "revolving_calculator",
          action_origin: "manual_form_submit",
        }),
      ),
    [],
  );

  const noNewUse = calculateRevolving({ ...input, monthlyNewPurchases: 0 });
  const changedPaymentRate =
    paymentRate < 100
      ? Math.min(100, paymentRate + 10)
      : Math.max(1, paymentRate - 10);
  const changedPayment = calculateRevolving({ ...input, paymentRatePercent: changedPaymentRate });
  const termComparisons = [12, 36, 60].map((termMonths) =>
    calculateRevolving({ ...input, months: termMonths }),
  );

  const chartTicks = Array.from(
    { length: Math.ceil(result.input.months / 12) + 1 },
    (_, index) => Math.min(result.input.months, Math.max(1, index * 12)),
  ).filter((month, index, items) => items.indexOf(month) === index);

  return (
    <>
      {calculator && <JsonLd calculator={calculator} />}
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-9 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-primary">금융 계산기</p>
            <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">
              리볼빙 장기 비용 계산기
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              이미 이월된 카드 원금, 내 약정 수수료율, 결제비율과 매달 새로 쓰는 금액을 입력해
              기간별 수수료·상환 원금·남은 잔액을 비교합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-7 sm:py-9">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <form
              className="space-y-5 rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                submitTracker();
              }}
            >
              <div>
                <h2 className="text-lg font-semibold text-text-primary">조건 입력</h2>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  예시값으로 계산이 시작됩니다. 화면에 표시된 기본값은 개인 약정이나 추천 금리가 아닙니다.
                </p>
              </div>

              <NumberInput
                id="revolving-initial-balance"
                label="이미 이월된 원금"
                value={rolloverBalance}
                min={0}
                max={1_000_000_000_000}
                unit="원"
                help="이번 달 카드값 전체가 아니라, 첫 시뮬레이션 결제일 직전에 이미 넘어와 있는 리볼빙 원금입니다. 이 금액은 첫 회차 수수료 대상입니다."
                onChange={setRolloverBalance}
              />

              <NumberInput
                id="revolving-annual-rate"
                label="내 약정 연 수수료율"
                value={annualFeeRate}
                min={0}
                max={100}
                step={0.01}
                unit="%"
                help="카드사 앱·명세서에서 확인한 본인 약정률을 입력하세요. 기본 17%는 계산 예시용 가정값입니다."
                onChange={setAnnualFeeRate}
              />

              <NumberInput
                id="revolving-payment-rate"
                label="약정 결제비율"
                value={paymentRate}
                min={1}
                max={100}
                unit="%"
                help="카드사에 약정한 비율을 입력하세요. 실제 약정 최소 결제비율 이상이어야 합니다."
                onChange={setPaymentRate}
              />

              <NumberInput
                id="revolving-monthly-use"
                label="매월 새로 쓰는 리볼빙 대상 일시불"
                value={monthlyPurchases}
                min={0}
                max={1_000_000_000_000}
                unit="원"
                help="이번 달 처음 청구되는 대상 일시불 금액입니다. 0원으로 두면 추가 사용 없이 기존 원금만 갚는 경우를 봅니다."
                onChange={setMonthlyPurchases}
              />

              <div>
                <label
                  htmlFor="revolving-months"
                  className="mb-2 flex items-center justify-between text-sm font-medium text-text-primary"
                >
                  <span>계산 기간</span>
                  <span className="tabular-nums text-primary">{result.input.months}개월</span>
                </label>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[12, 36, 60].map((months) => (
                    <button
                      key={months}
                      type="button"
                      aria-pressed={result.input.months === months}
                      onClick={() => setMonths(months)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        result.input.months === months
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background text-text-primary hover:border-primary"
                      }`}
                    >
                      {months / 12}년
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="revolving-months"
                    type="range"
                    min={1}
                    max={60}
                    value={result.input.months}
                    aria-label="계산 기간 개월 수"
                    onChange={(event) =>
                      setMonths(Number(event.currentTarget.value))
                    }
                    className="min-w-0 flex-1 accent-primary"
                  />
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={result.input.months}
                    aria-label="계산 기간 직접 입력, 개월"
                    onChange={(event) => {
                      const next = event.currentTarget.valueAsNumber;
                      if (Number.isFinite(next)) setMonths(Math.round(Math.min(60, Math.max(1, next))));
                    }}
                    className="w-20 rounded-lg border border-border px-2 py-2 text-center text-sm tabular-nums focus:border-primary focus:outline-none"
                  />
                  <span className="text-sm text-text-secondary">개월</span>
                </div>
                <p className="mt-1 text-xs text-text-secondary">1~60개월 범위에서 계산합니다.</p>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                조건으로 비용 다시 확인
              </button>
            </form>

            <section aria-labelledby="revolving-result-heading" className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 id="revolving-result-heading" className="text-lg font-semibold text-text-primary">
                    {result.input.months}개월 예상 결과
                  </h2>
                  <p className="mt-1 text-xs text-text-secondary">
                    원금 입력 {fmtWon(result.input.initialRolloverPrincipal)} + 기간 중 신규 사용 {fmtWon(result.totalNewPurchases)}
                  </p>
                </div>
                {result.payoffMonth !== null && (
                  <span className="rounded-full bg-positive-light px-3 py-1 text-xs font-medium text-positive">
                    이월 원금 {result.payoffMonth}개월 차에 상환 완료
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="누적 수수료" value={fmtWon(result.totalFee)} tone="primary" />
                <SummaryCard label="원금 상환액" value={fmtWon(result.totalPrincipalPaid)} />
                <SummaryCard label="총 납부액" value={fmtWon(result.totalPayment)} detail="원금 상환액 + 수수료" />
                <SummaryCard label="기간 말 남은 원금" value={fmtWon(result.endingPrincipal)} />
              </div>
              <p className="rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-text-secondary">
                연 수수료율 ÷ 12 월근사입니다. 카드사별 최소청구액·연체료와 실제 결제일 사이 경과일수는 반영하지 않습니다.
              </p>

              <div className="rounded-xl border border-border bg-background p-4 sm:p-5">
                <h3 className="font-semibold text-text-primary">이월 원금과 누적 수수료</h3>
                <p className="mt-1 text-xs text-text-secondary">이월 원금은 왼쪽 축, 누적 수수료는 오른쪽 축입니다.</p>
                <div className="mt-3 h-64 w-full" role="img" aria-label={`${result.input.months}개월 동안 이월 원금과 누적 수수료 추이 그래프`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.schedule} margin={{ top: 8, right: 3, left: 3, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="month"
                        type="number"
                        domain={[1, result.input.months]}
                        ticks={chartTicks}
                        tickFormatter={(month: number) => `${month}개월`}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        yAxisId="balance"
                        width={66}
                        tickFormatter={(value: number) => compactWon(value)}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="fee"
                        orientation="right"
                        width={66}
                        tickFormatter={(value: number) => compactWon(value)}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip
                        labelFormatter={(month) => `${month}개월 차`}
                        formatter={(value, name) => [fmtWon(Number(value ?? 0)), String(name)]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line
                        yAxisId="balance"
                        type="monotone"
                        dataKey="endingPrincipal"
                        name="이월 원금"
                        stroke="#1464c0"
                        strokeWidth={2.5}
                        dot={result.input.months === 1}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="fee"
                        type="monotone"
                        dataKey="cumulativeFee"
                        name="누적 수수료"
                        stroke="#dc6b24"
                        strokeWidth={2.5}
                        dot={result.input.months === 1}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                  잔액이 0원이 된 뒤 추가 사용이 없다면 수수료도 더 붙지 않습니다. 매월 사용액이 있더라도 결제비율 100%이면 그 신규 원금은 이월되지 않습니다.
                </p>
              </div>
            </section>
          </div>

          <section className="space-y-4" aria-labelledby="revolving-term-heading">
            <div>
              <h2 id="revolving-term-heading" className="text-lg font-semibold text-text-primary">같은 입력의 1·3·5년 비교</h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                기간이 길수록 신규 사용 총액도 늘어납니다. 원금과 남은 잔액을 함께 확인하세요.
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-background">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="bg-surface text-xs text-text-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">기간</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">누적 신규 사용</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">누적 수수료</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">원금 상환액</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">총 납부액</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">기말 원금</th>
                  </tr>
                </thead>
                <tbody>
                  {termComparisons.map((comparison) => (
                    <tr key={comparison.input.months} className="border-t border-border">
                      <th scope="row" className="whitespace-nowrap px-4 py-3 font-semibold text-text-primary">
                        {comparison.input.months / 12}년 ({comparison.input.months}개월)
                      </th>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(comparison.totalNewPurchases)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">{fmtWon(comparison.totalFee)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(comparison.totalPrincipalPaid)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(comparison.totalPayment)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(comparison.endingPrincipal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              누적 신규 사용은 입력한 월 사용액 × 기간입니다. 각 행의 총 납부액 = 원금 상환액 + 수수료이며, 기간 말 원금 = 초기 이월 원금 + 누적 신규 사용 − 원금 상환액입니다.
            </p>
          </section>

          <section className="space-y-4" aria-labelledby="revolving-scenarios-heading">
            <div>
              <h2 id="revolving-scenarios-heading" className="text-lg font-semibold text-text-primary">사용액과 결제비율 바꿔 보기</h2>
              <p className="mt-1 text-sm text-text-secondary">현재 선택한 {result.input.months}개월 동안 다른 조건 하나만 바꿔 비교합니다.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <ScenarioCard
                title="현재 입력"
                subtitle={`매월 ${fmtWon(result.input.monthlyNewPurchases)} 사용 · 결제비율 ${fmtPercent(result.input.paymentRatePercent)}`}
                result={result}
              />
              <ScenarioCard
                title="추가 사용 없음"
                subtitle={`매월 신규 사용 0원 · 결제비율 ${fmtPercent(result.input.paymentRatePercent)}`}
                result={noNewUse}
                interestDifference={noNewUse.totalFee - result.totalFee}
              />
              <ScenarioCard
                title="결제비율 변경"
                subtitle={`매월 사용액 유지 · ${fmtPercent(result.input.paymentRatePercent)} → ${fmtPercent(changedPaymentRate)}`}
                result={changedPayment}
                interestDifference={changedPayment.totalFee - result.totalFee}
              />
            </div>
          </section>

          <section className="space-y-3" aria-labelledby="revolving-year-heading">
            <div>
              <h2 id="revolving-year-heading" className="text-lg font-semibold text-text-primary">연도별 예상 납부표</h2>
              <p className="mt-1 text-sm text-text-secondary">선택 기간 동안 매년 새로 쓴 금액·원금 상환·수수료와 연말 원금을 봅니다.</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-border bg-background">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-surface text-xs text-text-secondary">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-medium">기간</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">신규 사용</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">원금 상환</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">수수료</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">총 납부</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">연말 이월 원금</th>
                  </tr>
                </thead>
                <tbody>
                  {yearly.map((row) => (
                    <tr key={row.firstMonth} className="border-t border-border">
                      <th scope="row" className="px-4 py-3 font-semibold text-text-primary">{row.label}</th>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(row.newPurchases)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(row.principalPaid)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(row.fee)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(row.totalPayment)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums">{fmtWon(row.endingPrincipal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 sm:p-5">
            <h2 className="font-semibold">계약서와 다른 점</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>매달 연 수수료율 ÷ 12로 계산하고 원 단위로 반올림합니다. 확인한 신한카드 개인회원 약관은 경과일수 ÷ 365 방식을 정하지만, 이 계산기는 카드사별 실제 일수 계산을 구현하지 않습니다.</li>
              <li>수수료는 원금에 합치지 않고 결제액에 별도 더합니다. 신규 일시불은 첫 청구까지 수수료가 없고, 첫 회차에는 이미 이월된 원금만 수수료 대상이라고 가정합니다.</li>
              <li>카드사·회원별 최소 결제비율, 최소 청구액, 소액 원금 전액 청구, 연체·금리 변경·중도 선결제는 반영하지 않습니다. 본인 약정 최소비율 이상을 입력해도 실제 명세서와 정확히 같다는 보장은 없습니다.</li>
              <li>기본 예시값은 개인 금리나 권장 결제비율이 아닙니다. 실제 약정률은 카드사 앱이나 이용대금명세서에서 확인하세요.</li>
            </ul>
          </aside>

          <GuideText title="리볼빙 계산 방식과 읽는 법">
            <ol className="list-decimal space-y-2 pl-5">
              <li>첫 회차 원금은 이미 이월된 원금과 이번 달 새로 청구된 리볼빙 대상 일시불을 더한 값입니다.</li>
              <li>약정 결제비율을 곱해 원금을 갚고, 수수료는 전월부터 이월된 원금에만 붙여 그 달 납부액에 더합니다.</li>
              <li>총 납부액은 원금 상환액과 누적 수수료의 합입니다. 수수료가 원금으로 다시 이월되는 복리 계산은 하지 않습니다.</li>
              <li>1·3·5년 비교는 같은 월 사용액과 결제비율을 각 기간 동안 유지한다고 가정합니다. 기간이 늘면 누적 신규 사용액도 함께 늘어납니다.</li>
            </ol>
          </GuideText>

          <section className="space-y-4" aria-labelledby="revolving-sources-heading">
            <div>
              <h2 id="revolving-sources-heading" className="text-lg font-semibold text-text-primary">계산 근거와 자주 묻는 질문</h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                산식은 공개된 카드사 안내와 약관의 공통 구조를 참고한 월 단위 추정입니다. 카드사별 약정 조건을 대신하지 않습니다.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
                <li><a className="text-primary underline" href="https://www.shinhancard.com/pconts/html/helpdesk/terms/terms56/1186792_1133.html" target="_blank" rel="noreferrer">신한카드 개인회원 약관 제35조</a> — 확인한 약관의 경과일수 ÷ 365 수수료 산식과 최소 결제 규정</li>
                <li><a className="text-primary underline" href="https://www.hanacard.co.kr/OPY30000000M.web" target="_blank" rel="noreferrer">하나카드 리볼빙 안내 및 계산 예시</a> — 전월 이월 잔액에 대한 수수료 예시</li>
              </ul>
            </div>
            <dl className="divide-y divide-border rounded-xl border border-border bg-background px-4">
              {calculator?.seo.faq.map((item) => (
                <div key={item.question} className="py-3">
                  <dt className="font-semibold text-text-primary">{item.question}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-text-secondary">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          {calculator && <RelatedCalculators calculatorId={calculator.id} />}
          <AdSlot type="banner" />
        </div>
      </main>
      <Footer />
    </>
  );
}

function compactWon(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${Math.round(value / 10_000)}만`;
  return Math.round(value).toLocaleString("ko-KR");
}
