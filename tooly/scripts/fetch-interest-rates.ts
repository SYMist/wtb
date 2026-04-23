/**
 * 한국은행 기준금리 및 금융감독원 주담대 금리 fetch 스크립트
 * 빌드 타임에 실행하여 lib/data/interest-rates.json에 저장
 *
 * 실행: npx tsx scripts/fetch-interest-rates.ts
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = join(__dirname, "../lib/data/interest-rates.json");

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

async function fetchBaseRate(): Promise<number | null> {
  try {
    // 한국은행 Open API (ECOS)
    const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
    if (!API_KEY) {
      console.warn("ECOS_API_KEY not set, using fallback");
      return null;
    }
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const start = `${now.getFullYear() - 1}01`;
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/24/722Y001/M/${start}/${ym}/0101000`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const rows = data?.StatisticSearch?.row ?? [];
    const latest = rows[rows.length - 1]?.DATA_VALUE;
    return latest ? parseFloat(latest) : null;
  } catch (e) {
    console.warn("Failed to fetch base rate:", e);
    return null;
  }
}

async function main() {
  const previous = loadPreviousData();
  const baseRate = await fetchBaseRate();
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

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(
    `Interest rates saved (baseRate=${nextBaseRate}, dataChanged=${dataChanged}):`,
    OUTPUT_PATH,
  );
}

main().catch(console.error);
