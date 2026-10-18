export type MonthlyRatePoint = { date: string; rate: number };

export type YearSummary = {
  year: number;
  points: MonthlyRatePoint[];
  averageOfMonthlyAverages: number;
  highMonth: MonthlyRatePoint;
  lowMonth: MonthlyRatePoint;
  highMonths: string[];
  lowMonths: string[];
  firstMonth: string;
  lastMonth: string;
  complete: boolean;
  previousYearComparable: boolean;
  previousYear?: {
    averageOfMonthlyAverages: number;
    months: number;
    change: number;
  };
};

export function availableYears(series: MonthlyRatePoint[]): number[] {
  return [...new Set(series.map((point) => Number(point.date.slice(0, 4))))].sort(
    (a, b) => a - b,
  );
}

export function summarizeYear(
  series: MonthlyRatePoint[],
  year: number,
): YearSummary | null {
  const points = series.filter((point) => point.date.startsWith(`${year}-`));
  if (!points.length) return null;
  if (points.some((point) => !/^\d{4}-(0[1-9]|1[0-2])$/.test(point.date))) {
    throw new Error(`연도 ${year}의 월 자료에 잘못된 날짜가 있습니다.`);
  }
  if (
    new Set(points.map((point) => point.date)).size !== points.length ||
    points.some((point, index) => index > 0 && points[index - 1].date >= point.date)
  ) {
    throw new Error(`연도 ${year}의 월 자료가 중복되었거나 오름차순이 아닙니다.`);
  }
  const averageOfMonthlyAverages =
    points.reduce((sum, point) => sum + point.rate, 0) / points.length;
  const highMonth = points.reduce((best, point) =>
    point.rate > best.rate ? point : best,
  );
  const lowMonth = points.reduce((best, point) =>
    point.rate < best.rate ? point : best,
  );
  const highMonths = points.filter((point) => point.rate === highMonth.rate).map((point) => point.date);
  const lowMonths = points.filter((point) => point.rate === lowMonth.rate).map((point) => point.date);
  const previousPoints = series.filter((point) =>
    point.date.startsWith(`${year - 1}-`),
  );
  const complete =
    points.length === 12 &&
    new Set(points.map((point) => point.date.slice(5))).size === 12 &&
    Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`).every((month) =>
      points.some((point) => point.date === month),
    );
  const matchingPreviousPoints = points
    .map((point) => previousPoints.find((previous) => previous.date.slice(5) === point.date.slice(5)))
    .filter((point): point is MonthlyRatePoint => point !== undefined);
  const previousYearComparable =
    points.length > 0 && matchingPreviousPoints.length === points.length;
  const previousAverage = previousYearComparable
    ? matchingPreviousPoints.reduce((sum, point) => sum + point.rate, 0) /
      matchingPreviousPoints.length
    : undefined;
  return {
    year,
    points,
    averageOfMonthlyAverages,
    highMonth,
    lowMonth,
    highMonths,
    lowMonths,
    firstMonth: points[0].date,
    lastMonth: points[points.length - 1].date,
    complete,
    previousYearComparable,
    ...(previousAverage === undefined
      ? {}
      : {
          previousYear: {
            averageOfMonthlyAverages: previousAverage,
            months: matchingPreviousPoints.length,
            change: averageOfMonthlyAverages - previousAverage,
          },
        }),
  };
}

export function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function parseYear(raw: string | undefined): number | null {
  if (!raw || !/^\d{4}$/.test(raw)) return null;
  const year = Number(raw);
  return Number.isSafeInteger(year) ? year : null;
}
