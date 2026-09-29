"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  chartPoints,
  defaultTreasuryComparison,
  fixedRateBondDirection,
  requiresAllHistory,
  formatSigned,
  nextChartSelection,
  selectTreasuryComparison,
  type TreasuryComparison,
  type ChartRange,
  type UsTreasuryInterpretationData,
} from "@/lib/data/us-treasury-interpretation";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
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
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const ReferenceLine = dynamic(
  () => import("recharts").then((m) => m.ReferenceLine),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

const USD_AMOUNT = 1000;

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatWon(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

function isSourceCheckStale(checkedAt: string | null) {
  if (!checkedAt) return true;
  const checked = new Date(`${checkedAt}T00:00:00Z`);
  const age = Date.now() - checked.getTime();
  return !Number.isFinite(age) || age > 8 * 24 * 60 * 60 * 1000;
}

function chartClickDate(event: unknown): string | null {
  if (typeof event !== "object" || event === null || !("activeLabel" in event)) return null;
  const label = (event as { activeLabel?: unknown }).activeLabel;
  return typeof label === "string" ? label : null;
}

function SelectionSummary({ label, date, value, requestedDate }: {
  label: "A" | "B";
  date: string;
  value: number;
  requestedDate: string;
}) {
  return (
    <div className="rounded-md bg-surface p-3">
      <p className="text-xs font-medium text-text-secondary">{label} 실제 관측일</p>
      <p className="mt-1 text-sm font-semibold text-text-primary">{formatDate(date)}</p>
      <p className="mt-1 text-lg font-bold text-primary">{formatPercent(value)}</p>
      {requestedDate !== date && (
        <p className="mt-1 text-[11px] text-text-secondary">
          선택일 {formatDate(requestedDate)}은 휴장·결측으로 직전 관측일에 맞췄습니다.
        </p>
      )}
    </div>
  );
}

function HistoryChart({
  data,
  comparison,
  pendingA,
  onDateSelect,
  range,
  onRangeChange,
}: {
  data: UsTreasuryInterpretationData;
  comparison: TreasuryComparison;
  pendingA: string | null;
  onDateSelect: (date: string) => void;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}) {
  const chartData = useMemo(
    () => chartPoints(
      data.treasury10y,
      range,
      600,
      [pendingA ?? comparison.a.date, comparison.b.date],
    ).map((point) => ({ date: point.date, rate: point.value })),
    [data.treasury10y, range, pendingA, comparison.a.date, comparison.b.date],
  );
  const dateTick = (date: string) => (range === "5Y" ? date.slice(0, 7) : date.slice(0, 4));

  return (
    <div>
      <div className="mb-3 flex gap-2" aria-label="그래프 범위">
        {(["5Y", "ALL"] as const).map((option) => (
          <button
            type="button"
            key={option}
            aria-pressed={range === option}
            onClick={() => onRangeChange(option)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${range === option ? "bg-primary text-white" : "bg-surface text-text-secondary"}`}
          >
            {option === "5Y" ? "최근 5년" : "전체"}
          </button>
        ))}
      </div>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
          onClick={(event: unknown) => {
            const date = chartClickDate(event);
            if (date) onDateSelect(date);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickCount={range === "5Y" ? 4 : 6}
            tickFormatter={dateTick}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
          />
          <Tooltip
            formatter={(value) => [formatPercent(Number(value)), "H.15 10년"]}
            labelStyle={{ fontSize: 12 }}
            contentStyle={{ fontSize: 12 }}
          />
          <ReferenceLine x={pendingA ?? comparison.a.date} stroke="#2563eb" label="A" />
          {!pendingA && <ReferenceLine x={comparison.b.date} stroke="#ea580c" label="B" />}
          <Line dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={false} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function UsTreasuryInterpretation({
  data,
}: {
  data: UsTreasuryInterpretationData | null;
}) {
  const defaultComparison = useMemo(
    () => (data ? defaultTreasuryComparison(data) : null),
    [data],
  );
  const [requestedA, setRequestedA] = useState(defaultComparison?.a.date ?? "");
  const [requestedB, setRequestedB] = useState(defaultComparison?.b.date ?? "");
  const [comparison, setComparison] = useState(defaultComparison);
  const [pendingChartA, setPendingChartA] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>("5Y");

  if (!data || !defaultComparison) {
    return (
      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950 sm:p-6">
        <h2 className="font-semibold">연준 관측값을 아직 표시하지 않습니다</h2>
        <p className="mt-2">
          Federal Reserve Board H.15/H.10 원천을 확인하지 못했을 때는 그래프나 예시 수치를 넣지 않습니다.
          실제 관측값이 갱신되면 이 화면에서 A/B 비교를 활성화합니다.
        </p>
      </section>
    );
  }

  const minDate = data.treasury10y[0]?.date;
  const maxDate = data.treasury10y.at(-1)?.date;
  const activeComparison = comparison ?? defaultComparison;
  const sourceCheckStale = isSourceCheckStale(data.sourceCheckedAt);
  const changeDirection =
    activeComparison.basisPointChange > 0
      ? "상승"
      : activeComparison.basisPointChange < 0
        ? "하락"
        : "변화 없음";
  const bondDirection = fixedRateBondDirection(activeComparison.basisPointChange);
  const selectChartDate = (date: string) => {
    const step = nextChartSelection(data, pendingChartA, date);
    if (step.pendingA) {
      setPendingChartA(step.pendingA);
      setRequestedA(date);
      return;
    }

    setRequestedB(date);
    if (step.comparison) {
      setComparison(step.comparison);
      trackEvent("us_treasury_compare_submit", {
        page: "us_treasury_10y",
        action_origin: "chart_point",
      });
    }
    setPendingChartA(null);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary">H.15 10년물 역사 그래프</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          미국 10년 만기 국채의 constant maturity yield입니다. A/B 선은 선택한 두 실제 관측일이며,
          그래프는 수익률 수준을 보여줄 뿐 이후 움직임을 예측하지 않습니다.
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          기본은 최근 5년이며 전체 이력으로 바꿀 수 있습니다. 표시점은 화면 성능을 위해 줄이되, A/B 계산은 원 관측값을 씁니다. 그래프에서 첫 시점을 탭하면 A, 다음 시점을 탭하면 B로 비교합니다. {pendingChartA
            ? "B를 선택하세요."
            : "날짜 입력으로도 비교할 수 있습니다."}
        </p>
        <div className="mt-5">
          <HistoryChart
            data={data}
            comparison={activeComparison}
            pendingA={pendingChartA}
            onDateSelect={selectChartDate}
            range={chartRange}
            onRangeChange={setChartRange}
          />
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          출처: Federal Reserve Board H.15 · H.15 준비 시각 {data.h15PreparedAt} · H.10 준비 시각 {data.h10PreparedAt} · 원천 확인 {data.sourceCheckedAt}
        </p>
        {sourceCheckStale && (
          <p className="mt-2 text-xs font-medium text-amber-700">
            원천 확인이 8일을 넘었습니다. 최신 관측값으로 단정하지 마세요.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary">두 시점 비교</h2>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const next = selectTreasuryComparison(data, requestedA, requestedB);
            if (!next) return;
            setComparison(next);
            setPendingChartA(null);
            if (chartRange === "5Y" && requiresAllHistory(data.treasury10y, [next.a.date, next.b.date])) {
              setChartRange("ALL");
            }
            trackEvent("us_treasury_compare_submit", {
              page: "us_treasury_10y",
              action_origin: "date_compare",
            });
          }}
        >
          <label className="text-xs text-text-secondary">
            A 선택일
            <input
              type="date"
              value={requestedA}
              min={minDate}
              max={maxDate}
              required
              onChange={(event) => setRequestedA(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <label className="text-xs text-text-secondary">
            B 선택일
            <input
              type="date"
              value={requestedB}
              min={minDate}
              max={maxDate}
              required
              onChange={(event) => setRequestedB(event.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            두 날짜 비교하기
          </button>
        </form>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <SelectionSummary label="A" {...activeComparison.a} />
          <SelectionSummary label="B" {...activeComparison.b} />
          <div className="rounded-md bg-surface p-3">
            <p className="text-xs font-medium text-text-secondary">B − A</p>
            <p className="mt-1 text-lg font-bold text-text-primary">
              {formatSigned(activeComparison.basisPointChange)}bp
            </p>
            <p className="mt-1 text-[11px] text-text-secondary">H.15 10년 수익률 {changeDirection}</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary">같은 기간 함께 변한 값</h2>
        {activeComparison.fx ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-surface p-3">
              <p className="text-xs text-text-secondary">A · 1,000달러 원화 환산</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {formatWon(activeComparison.fx.a.value * USD_AMOUNT)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">H.10 {formatDate(activeComparison.fx.a.date)}</p>
            </div>
            <div className="rounded-md bg-surface p-3">
              <p className="text-xs text-text-secondary">B · 1,000달러 원화 환산</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {formatWon(activeComparison.fx.b.value * USD_AMOUNT)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">H.10 {formatDate(activeComparison.fx.b.date)}</p>
            </div>
            <div className="rounded-md bg-surface p-3">
              <p className="text-xs text-text-secondary">환산 차이</p>
              <p className="mt-1 text-lg font-bold text-text-primary">
                {formatSigned(activeComparison.fx.wonChangeForUsd1000)}원
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">뉴욕 정오 기준의 관측값</p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-secondary">
            두 H.15 실제 관측일 모두에 같은 날짜 H.10 값이 없어 환산 카드를 숨겼습니다. 이전 환율로 채우지 않습니다.
          </p>
        )}
        <p className="mt-3 text-[11px] leading-relaxed text-text-secondary">
          H.10은 뉴욕 정오 cable transfer 기준 원/달러 환율입니다. 국내 카드·은행의 실제 결제환율과 다를 수 있으며,
          이 변화가 미국채 금리 때문에 일어났다고 해석하지 않습니다.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-text-secondary sm:p-6">
        <h2 className="text-lg font-semibold text-text-primary">영향을 받을 수 있는 경로</h2>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-md bg-amber-50 px-3 py-2 text-amber-900">시장 수익률 {bondDirection.yield}</span>
          <span aria-hidden="true" className="text-text-secondary">→</span>
          <span className="rounded-md bg-blue-50 px-3 py-2 text-blue-900">기존 고정금리 채권 가격 {bondDirection.price}</span>
        </div>
        <p className="mt-2">
          시장 수익률이 오르면 이미 발행된 고정금리 채권 가격은 다른 조건이 같을 때 하락하는 방향입니다.
          개별 채권의 쿠폰·만기·듀레이션이 없으므로 이 화면은 보유 채권의 평가액이나 수익률을 계산하지 않습니다.
        </p>
      </section>
    </div>
  );
}
