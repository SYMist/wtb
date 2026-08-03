/**
 * 예금은행 정기예금 신규취급액 가중평균금리 월별 시계열 fetch
 * ECOS 121Y013 / item BEABAB2111 / M (예금은행 정기예금 신규취급액 가중평균)
 *
 * 실행: npx tsx --env-file=.env.local scripts/fetch-deposit-rate-series.ts
 * 필요 환경변수: ECOS_API_KEY
 */

import { join } from "path";

import { type Point, saveSeries } from "./lib/series";

const OUTPUT_PATH = join(
  process.cwd(),
  "lib/data/deposit-rate-series.json",
);

async function fetchSeries(): Promise<Point[]> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) throw new Error("ECOS_API_KEY 환경변수가 필요합니다.");

  const now = new Date();
  const start = "199601";
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/1000/121Y013/M/${start}/${end}/BEABAB2111`;

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

async function main() {
  saveSeries(OUTPUT_PATH, await fetchSeries(), "%");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
