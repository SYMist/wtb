/**
 * 소비자물가지수(CPI) 총지수 월별 시계열 fetch 스크립트.
 * ECOS Open API 901Y009(항목 0=총지수)에서 1965-01 ~ 현재월 원지수를 받아
 * - lib/data/cpi-index-series.json: 원지수(화폐가치 환산 섹션의 원천, 1965-01~)
 * - lib/data/cpi-rate-series.json: 전년동월비 %(표시 정본 — 첫 12개월은 전년 데이터가
 *   없어 계산 불가하므로 제외, 1966-01~)
 * 두 파일에 저장합니다. 기준연도(UNIT_NAME "YYYY=100")가 이전 파일과 다르면
 * saveSeries의 baseYear 가드가 부분 머지 대신 전량 재적재합니다(기준연도 개편 대비).
 *
 * 실행: npx tsx scripts/fetch-cpi-series.ts
 * 필요 환경변수: ECOS_API_KEY (한국은행 ECOS Open API 인증키)
 */

import { join } from "path";

import { type Point, saveSeries } from "./lib/series";

const INDEX_OUTPUT_PATH = join(process.cwd(), "lib/data/cpi-index-series.json");
const RATE_OUTPUT_PATH = join(process.cwd(), "lib/data/cpi-rate-series.json");
const STAT_CODE = "901Y009";
const ITEM_CODE = "0"; // 총지수

interface IndexPoint {
  date: string; // "YYYY-MM"
  index: number;
}

/** "YYYY-MM"에 개월수를 더한다(음수 가능). */
function shiftMonths(ym: string, months: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

async function fetchCpiIndex(): Promise<{ points: IndexPoint[]; baseYear: number }> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) {
    throw new Error("ECOS_API_KEY (또는 BOK_API_KEY) 환경변수가 필요합니다.");
  }

  const now = new Date();
  const start = "196501";
  const end = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/2000/${STAT_CODE}/M/${start}/${end}/${ITEM_CODE}`;

  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) {
    throw new Error(`ECOS API HTTP ${res.status}`);
  }
  const data = await res.json();
  if (data.RESULT) {
    throw new Error(`ECOS API error: ${data.RESULT.CODE} ${data.RESULT.MESSAGE}`);
  }
  const rows: Array<{ TIME: string; DATA_VALUE: string; UNIT_NAME: string }> =
    data?.StatisticSearch?.row ?? [];
  if (rows.length === 0) {
    throw new Error("ECOS API returned empty result");
  }

  // 기준연도 확증 — UNIT_NAME "2020=100" 형태 파싱. 실패하면 baseYear 가드가
  // 못 켜져 개편이 조용히 흘러들 수 있으므로 여기서 명시적으로 실패시킨다.
  const unitMatch = rows[0].UNIT_NAME?.match(/^(\d{4})=100$/);
  if (!unitMatch) {
    throw new Error(`UNIT_NAME에서 기준연도를 못 읽었습니다: "${rows[0].UNIT_NAME}"`);
  }
  const baseYear = Number(unitMatch[1]);

  const points = rows.map((r) => ({
    date: `${r.TIME.slice(0, 4)}-${r.TIME.slice(4, 6)}`,
    index: parseFloat(r.DATA_VALUE),
  }));

  return { points, baseYear };
}

/** 원지수에서 전년동월비(%)를 파생한다. 전년 같은 달이 없으면(시계열 첫 12개월) 제외한다. */
function toYoyRatePoints(index: IndexPoint[]): Point[] {
  const byDate = new Map(index.map((p) => [p.date, p.index]));
  const out: Point[] = [];
  for (const p of index) {
    const prior = byDate.get(shiftMonths(p.date, -12));
    if (prior === undefined || prior === 0) continue;
    out.push({ date: p.date, rate: Math.round(((p.index - prior) / prior) * 10000) / 100 });
  }
  return out;
}

async function main() {
  const { points, baseYear } = await fetchCpiIndex();

  saveSeries(
    INDEX_OUTPUT_PATH,
    points.map((p) => ({ date: p.date, rate: p.index })),
    `(${baseYear}=100)`,
    { baseYear },
  );

  const rateSeries = toYoyRatePoints(points);
  saveSeries(RATE_OUTPUT_PATH, rateSeries, "%", { baseYear });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
