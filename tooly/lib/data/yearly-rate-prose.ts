type Point = { date: string; rate: number };

export interface YearlyRateProse {
  year: string;
  heading: string;
  text: string;
}

// 연중 변경 횟수가 이 이하면(정책금리처럼 계단식) 변경 시점을 전부 나열,
// 초과하면(시장금리처럼 매달 변동) 시작·최고·최저·마감으로 요약한다.
const TRAJECTORY_MAX_CHANGES = 4;

function formatYM(ym: string) {
  const [, m] = ym.split("-");
  return `${parseInt(m, 10)}월`;
}

function formatRate(v: number) {
  return `${v}%`;
}

/**
 * series JSON에서 연도별 서술 블록을 생성한다(값 하드코딩 금지 — 항상 원천 데이터에서 계산).
 * "{연도}년 {월} {label}" 형태의 과거시점 롱테일 쿼리를 타깃한다.
 */
export function buildYearlyRateProse(series: Point[], label: string): YearlyRateProse[] {
  const withPrev = series.map((p, i) => ({
    ...p,
    prevRate: i > 0 ? series[i - 1].rate : null,
  }));

  const byYear = new Map<string, typeof withPrev>();
  for (const p of withPrev) {
    const year = p.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(p);
  }

  const years = [...byYear.keys()].sort((a, b) => Number(b) - Number(a));

  return years.map((year) => {
    const points = byYear.get(year)!;
    const start = points[0];
    const end = points[points.length - 1];
    // 그 해 첫 달(start)은 별도로 표기하므로 변경 목록에서는 제외.
    const changesAfterStart = points
      .slice(1)
      .filter((p) => p.prevRate !== null && p.prevRate !== p.rate);

    let text: string;
    if (changesAfterStart.length === 0) {
      text = `${year}년 ${label}는 연중 ${formatRate(start.rate)}로 유지됐습니다.`;
    } else if (changesAfterStart.length <= TRAJECTORY_MAX_CHANGES) {
      const trajectory = [start, ...changesAfterStart]
        .map((p) => `${formatYM(p.date)} ${formatRate(p.rate)}`)
        .join(" → ");
      const overallDir =
        end.rate > start.rate ? "인상" : end.rate < start.rate ? "인하" : "동결";
      text = `${year}년 ${label} 흐름: ${trajectory}. 연간 ${changesAfterStart.length}회 조정을 거쳐 ${overallDir} 기조로 ${formatYM(end.date)} 기준 ${formatRate(end.rate)}에 마감했습니다.`;
    } else {
      const max = points.reduce((m, p) => (p.rate > m.rate ? p : m), points[0]);
      const min = points.reduce((m, p) => (p.rate < m.rate ? p : m), points[0]);
      const overallDir =
        end.rate > start.rate ? "상승" : end.rate < start.rate ? "하락" : "보합";
      text = `${year}년 ${label}는 ${formatYM(start.date)} ${formatRate(start.rate)}로 시작해 ${formatYM(end.date)} ${formatRate(end.rate)}로 마감했습니다. 연중 최고는 ${formatYM(max.date)} ${formatRate(max.rate)}, 최저는 ${formatYM(min.date)} ${formatRate(min.rate)}였고 전반적으로 ${overallDir} 흐름을 보였습니다.`;
    }

    return { year, heading: `${year}년 ${label}`, text };
  });
}
