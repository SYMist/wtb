export type BoardObservation = {
  date: string;
  value: number;
};

export type UsTreasuryInterpretationData = {
  treasury10y: BoardObservation[];
  krwPerUsd: BoardObservation[];
  h15PreparedAt: string;
  h10PreparedAt: string;
  sourceCheckedAt: string | null;
};

export type SelectedObservation = BoardObservation & {
  requestedDate: string;
};

export type TreasuryComparison = {
  a: SelectedObservation;
  b: SelectedObservation;
  basisPointChange: number;
  fx: {
    a: BoardObservation;
    b: BoardObservation;
    wonChangeForUsd1000: number;
  } | null;
};

export type ChartSelectionStep = {
  pendingA: string | null;
  comparison: TreasuryComparison | null;
};

export type ChartRange = "5Y" | "ALL";

function latestOnOrBefore(
  series: BoardObservation[],
  requestedDate: string,
): BoardObservation | null {
  for (let index = series.length - 1; index >= 0; index -= 1) {
    const point = series[index];
    if (point.date <= requestedDate) return point;
  }
  return null;
}

function exactDate(
  series: BoardObservation[],
  date: string,
): BoardObservation | null {
  return series.find((point) => point.date === date) ?? null;
}

/**
 * H.15 선택일은 직전 유효 관측일로만 보정한다. 환율은 같은 날짜 관측값이
 * 있을 때만 카드에 넣어 휴장일 값을 임의로 이어 붙이지 않는다.
 */
export function selectTreasuryComparison(
  data: UsTreasuryInterpretationData,
  requestedA: string,
  requestedB: string,
): TreasuryComparison | null {
  const aPoint = latestOnOrBefore(data.treasury10y, requestedA);
  const bPoint = latestOnOrBefore(data.treasury10y, requestedB);
  if (!aPoint || !bPoint) return null;

  const a = { ...aPoint, requestedDate: requestedA };
  const b = { ...bPoint, requestedDate: requestedB };
  const fxA = exactDate(data.krwPerUsd, a.date);
  const fxB = exactDate(data.krwPerUsd, b.date);

  return {
    a,
    b,
    basisPointChange: Math.round((b.value - a.value) * 100),
    fx:
      fxA && fxB
        ? {
            a: fxA,
            b: fxB,
            wonChangeForUsd1000: Math.round((fxB.value - fxA.value) * 1000),
          }
        : null,
  };
}

/** 최근 두 H.15 관측일 모두에 같은 날짜 H.10 값이 있어야 기본 비교를 만든다. */
export function defaultTreasuryComparison(
  data: UsTreasuryInterpretationData,
): TreasuryComparison | null {
  const fxDates = new Set(data.krwPerUsd.map((point) => point.date));
  const eligibleDates = data.treasury10y
    .filter((point) => fxDates.has(point.date))
    .map((point) => point.date);
  if (eligibleDates.length < 2) return null;

  const b = eligibleDates.at(-1)!;
  const [year, month, day] = b.split("-").map(Number);
  const priorYearLastDay = new Date(Date.UTC(year - 1, month, 0)).getUTCDate();
  const target = `${year - 1}-${String(month).padStart(2, "0")}-${String(Math.min(day, priorYearLastDay)).padStart(2, "0")}`;
  const a = [...eligibleDates].reverse().find((date) => date <= target) ?? eligibleDates.at(-2)!;
  return selectTreasuryComparison(data, a, b);
}

/** 그래프의 첫 선택은 A로 보관하고, 두 번째 선택에서만 비교를 확정한다. */
export function nextChartSelection(
  data: UsTreasuryInterpretationData,
  pendingA: string | null,
  selectedDate: string,
): ChartSelectionStep {
  if (!pendingA) return { pendingA: selectedDate, comparison: null };

  return {
    pendingA: null,
    comparison: selectTreasuryComparison(data, pendingA, selectedDate),
  };
}

/**
 * 그래프는 화면 폭에 맞게 표시점만 줄인다. 반환한 점도 실제 관측값이며,
 * A/B 수치 계산에는 원본 전체 시계열을 계속 사용한다.
 */
export function chartPoints(
  series: BoardObservation[],
  range: ChartRange,
  maximumPoints = 600,
  highlightedDates: string[] = [],
): BoardObservation[] {
  const latestDate = series.at(-1)?.date;
  if (!latestDate) return [];

  let visible = series;
  if (range === "5Y") {
    const cutoff = new Date(`${latestDate}T00:00:00Z`);
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 5);
    const cutoffDate = cutoff.toISOString().slice(0, 10);
    visible = series.filter((point) => point.date >= cutoffDate);
  }
  if (visible.length <= maximumPoints) return visible;

  const step = Math.ceil(visible.length / maximumPoints);
  const dates = new Set(visible.filter((_, index) => index % step === 0).map((point) => point.date));
  const min = visible.reduce((current, point) => (point.value < current.value ? point : current));
  const max = visible.reduce((current, point) => (point.value > current.value ? point : current));
  dates.add(visible[0].date);
  dates.add(visible.at(-1)!.date);
  dates.add(min.date);
  dates.add(max.date);
  for (const date of highlightedDates) dates.add(date);
  return visible.filter((point) => dates.has(point.date));
}

export function formatSigned(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toLocaleString("ko-KR")}`;
}

export function fixedRateBondDirection(basisPointChange: number) {
  if (basisPointChange > 0) return { yield: "↑", price: "↓" };
  if (basisPointChange < 0) return { yield: "↓", price: "↑" };
  return { yield: "변화 없음", price: "변화 없음" };
}
