/**
 * 한국은행 기준금리 월별 시계열 fetch 스크립트
 * ECOS Open API에서 2000-01 ~ 현재월 데이터를 받아
 * lib/data/base-rate-series.json에 저장합니다.
 *
 * 실행: npx tsx scripts/fetch-base-rate-series.ts
 * 필요 환경변수: ECOS_API_KEY (한국은행 ECOS Open API 인증키)
 */

import { writeFileSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = join(process.cwd(), "lib/data/base-rate-series.json");

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

async function fetchBaseRateSeries(): Promise<Point[]> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) {
    throw new Error("ECOS_API_KEY (또는 BOK_API_KEY) 환경변수가 필요합니다.");
  }

  const now = new Date();
  const start = "200001";
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/1000/722Y001/M/${start}/${end}/0101000`;

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    throw new Error(`ECOS API HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.RESULT) {
    throw new Error(`ECOS API error: ${data.RESULT.CODE} ${data.RESULT.MESSAGE}`);
  }
  const rows: Array<{ TIME: string; DATA_VALUE: string }> =
    data?.StatisticSearch?.row ?? [];
  if (rows.length === 0) {
    throw new Error("ECOS API returned empty result");
  }
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
  const raw = await fetchBaseRateSeries();
  const series = raw.sort((a, b) => a.date.localeCompare(b.date));
  const result: Series = {
    series,
    latest: series[series.length - 1],
    stats: computeStats(series),
    updatedAt: new Date().toISOString().split("T")[0],
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(
    `Saved ${series.length} points (${series[0].date} ~ ${result.latest.date}, latest=${result.latest.rate}%) to ${OUTPUT_PATH}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
