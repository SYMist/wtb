/**
 * 원/유로 매매기준율 월평균 / ECOS 731Y004 item 0000003(원/유로) × 0000100(평균자료)
 *
 * 실행: npx tsx --env-file=.env.local scripts/fetch-eurkrw-rate-series.ts
 * 필요 환경변수: ECOS_API_KEY
 */

import { join } from "path";

import { type Point, saveSeries } from "./lib/series";

const OUTPUT_PATH = join(
  process.cwd(),
  "lib/data/eurkrw-rate-series.json",
);

async function fetchSeries(): Promise<Point[]> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) {
    throw new Error("ECOS_API_KEY 환경변수가 필요합니다.");
  }

  const now = new Date();
  const start = "199901";
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/2000/731Y004/M/${start}/${end}/0000003/0000100`;

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
  saveSeries(OUTPUT_PATH, await fetchSeries(), "원/유로");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
