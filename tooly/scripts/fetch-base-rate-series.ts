/**
 * 한국은행 기준금리 월별 시계열 fetch 스크립트
 * ECOS Open API에서 2000-01 ~ 현재월 데이터를 받아
 * lib/data/base-rate-series.json에 저장합니다.
 *
 * 실행: npx tsx scripts/fetch-base-rate-series.ts
 * 필요 환경변수: ECOS_API_KEY (한국은행 ECOS Open API 인증키)
 */

import { join } from "path";

import { type Point, saveSeries } from "./lib/series";

const OUTPUT_PATH = join(process.cwd(), "lib/data/base-rate-series.json");

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

async function main() {
  saveSeries(OUTPUT_PATH, await fetchBaseRateSeries(), "%");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
