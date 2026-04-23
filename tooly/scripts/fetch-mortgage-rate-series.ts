/**
 * 예금은행 주택담보대출 신규취급액 가중평균금리 월별 시계열 fetch
 * ECOS 121Y006 / item BECBLA0302 / M
 *
 * 실행: npx tsx --env-file=.env.local scripts/fetch-mortgage-rate-series.ts
 * 필요 환경변수: ECOS_API_KEY
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = join(
  process.cwd(),
  "lib/data/mortgage-rate-series.json",
);

interface Point {
  date: string; // "YYYY-MM"
  rate: number;
}

interface Series {
  series: Point[];
  latest: Point;
  stats: {
    max: { date: string; rate: number };
    min: { date: string; rate: number };
    average: number;
  };
  updatedAt: string;
}

async function fetchSeries(): Promise<Point[]> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) {
    throw new Error("ECOS_API_KEY 환경변수가 필요합니다.");
  }

  const now = new Date();
  const start = "200109";
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/1000/121Y006/M/${start}/${end}/BECBLA0302`;

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`ECOS API HTTP ${res.status}`);
  const data = await res.json();
  if (data.RESULT) {
    throw new Error(`ECOS API error: ${data.RESULT.CODE} ${data.RESULT.MESSAGE}`);
  }
  const rows: Array<{ TIME: string; DATA_VALUE: string }> =
    data?.StatisticSearch?.row ?? [];
  if (rows.length === 0) throw new Error("ECOS API returned empty result");
  return rows.map((r) => ({
    date: `${r.TIME.slice(0, 4)}-${r.TIME.slice(4, 6)}`,
    rate: parseFloat(r.DATA_VALUE),
  }));
}

function computeStats(series: Point[]): Series["stats"] {
  const max = series.reduce((m, p) => (p.rate > m.rate ? p : m), series[0]);
  const min = series.reduce((m, p) => (p.rate < m.rate ? p : m), series[0]);
  const sum = series.reduce((s, p) => s + p.rate, 0);
  return {
    max,
    min,
    average: Math.round((sum / series.length) * 100) / 100,
  };
}

async function main() {
  const raw = await fetchSeries();
  const series = raw.sort((a, b) => a.date.localeCompare(b.date));
  const today = new Date().toISOString().split("T")[0];

  let previousUpdatedAt: string | null = null;
  let previousSeriesJson: string | null = null;
  if (existsSync(OUTPUT_PATH)) {
    try {
      const prev = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8")) as Series;
      previousUpdatedAt = prev.updatedAt;
      previousSeriesJson = JSON.stringify(prev.series);
    } catch {
      // fall through
    }
  }

  const dataChanged = JSON.stringify(series) !== previousSeriesJson;
  const result: Series = {
    series,
    latest: series[series.length - 1],
    stats: computeStats(series),
    updatedAt: dataChanged ? today : (previousUpdatedAt ?? today),
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(
    `Saved ${series.length} points (${series[0].date} ~ ${result.latest.date}, latest=${result.latest.rate}%, dataChanged=${dataChanged}) to ${OUTPUT_PATH}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
