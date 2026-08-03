/**
 * 한국은행 기준금리 및 금융감독원 주담대 금리 fetch 스크립트
 * 빌드 타임에 실행하여 lib/data/interest-rates.json에 저장
 *
 * baseRate는 ECOS를 따로 호출하지 않고 base-rate-series.json의 latest에서
 * 파생한다(단일 진실원). 그래야 시계열 쪽 덮어쓰기 가드가 스냅샷에도 그대로
 * 적용된다 — 별도 호출로 두면 ECOS 미발행 월에 스냅샷만 과거로 후퇴한다
 * (2026-08-01 사고). update-ecos-data.yml이 시계열 스크립트를 먼저 돌리므로
 * 실행 순서는 안전.
 *
 * 실행: npx tsx scripts/fetch-interest-rates.ts
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

import { readPreviousSeries } from "./lib/series";

const OUTPUT_PATH = join(__dirname, "../lib/data/interest-rates.json");
const BASE_RATE_SERIES_PATH = join(
  __dirname,
  "../lib/data/base-rate-series.json",
);

interface InterestRateData {
  baseRate: number;
  bankRates: { bank: string; minRate: number; maxRate: number }[];
  updatedAt: string;
}

const FALLBACK: InterestRateData = {
  baseRate: 2.75,
  bankRates: [
    { bank: "KB국민은행", minRate: 3.41, maxRate: 5.09 },
    { bank: "신한은행", minRate: 3.38, maxRate: 5.15 },
    { bank: "하나은행", minRate: 3.35, maxRate: 5.02 },
    { bank: "우리은행", minRate: 3.42, maxRate: 5.11 },
    { bank: "NH농협은행", minRate: 3.39, maxRate: 5.08 },
  ],
  updatedAt: "2026-04-01",
};

function loadPreviousData(): InterestRateData | null {
  if (!existsSync(OUTPUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

/** base-rate-series.json의 latest에서 파생 — 별도 ECOS 호출 없음. */
function readBaseRate(): number | null {
  const series = readPreviousSeries(BASE_RATE_SERIES_PATH);
  if (!series?.latest) {
    console.warn("base-rate-series.json을 읽지 못했습니다, 이전 값 유지");
    return null;
  }
  console.log(
    `baseRate from base-rate-series.json latest: ${series.latest.date} ${series.latest.rate}%`,
  );
  return series.latest.rate;
}

function main() {
  const previous = loadPreviousData();
  const baseRate = readBaseRate();
  const today = new Date().toISOString().split("T")[0];

  const nextBaseRate = baseRate ?? previous?.baseRate ?? FALLBACK.baseRate;
  const nextBankRates = previous?.bankRates ?? FALLBACK.bankRates;

  const dataChanged =
    !previous ||
    previous.baseRate !== nextBaseRate ||
    JSON.stringify(previous.bankRates) !== JSON.stringify(nextBankRates);

  const result: InterestRateData = {
    baseRate: nextBaseRate,
    bankRates: nextBankRates,
    updatedAt: dataChanged ? today : (previous?.updatedAt ?? today),
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + "\n", "utf-8");
  console.log(
    `Interest rates saved (baseRate=${nextBaseRate}, dataChanged=${dataChanged}):`,
    OUTPUT_PATH,
  );
}

try {
  main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
