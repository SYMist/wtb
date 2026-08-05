type Point = { date: string; rate: number };

export interface YearlyRateAverage {
  year: string;
  /** 그 해 월별 값의 산술평균(소수 2자리 반올림). */
  average: number;
  /** 전년 평균 대비 차이(%p). 첫 해는 null. */
  change: number | null;
  /** 그 해 데이터가 있는 월 수 — 12 미만이면 부분연도. */
  months: number;
  /** 그 해 실제 데이터 구간("YYYY-MM"). 부분연도 주석에 쓴다. */
  from: string;
  to: string;
}

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

/**
 * series JSON에서 연도별 평균 표를 생성한다(값 하드코딩 금지 — 항상 원천 데이터에서 계산).
 * 월별 319행 표는 스니펫에 앞 3행만 잡히는 문제가 있어, 검색엔진이 통째로 인용할 수 있는
 * "작은 표"를 따로 준다. 반환 순서는 최신 연도 우선.
 */
export function buildYearlyRateAverages(series: Point[]): YearlyRateAverage[] {
  const byYear = new Map<string, Point[]>();
  for (const p of series) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }

  const ascending = [...byYear.keys()].sort((a, b) => Number(a) - Number(b));
  const averageOf = (year: string) => {
    const points = byYear.get(year)!;
    return round2(points.reduce((s, p) => s + p.rate, 0) / points.length);
  };

  const rows = ascending.map((year, i) => {
    const points = [...byYear.get(year)!].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const average = averageOf(year);
    const prevYear = ascending[i - 1];
    const prevAverage = prevYear ? averageOf(prevYear) : null;
    return {
      year,
      average,
      // 표시값끼리의 차이로 계산한다 — 반올림 전 값으로 빼면 표 안에서 숫자가 안 맞는다.
      change: prevAverage === null ? null : round2(average - prevAverage),
      months: points.length,
      from: points[0].date,
      to: points[points.length - 1].date,
    };
  });

  return rows.reverse();
}
