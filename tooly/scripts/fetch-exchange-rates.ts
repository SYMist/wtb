/**
 * 한국수출입은행 환율 fetch 스크립트
 * 빌드 타임에 실행하여 lib/data/exchange-rates.json에 저장
 *
 * 실행: npx tsx scripts/fetch-exchange-rates.ts
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_PATH = join(__dirname, "../lib/data/exchange-rates.json");

interface ExchangeRate {
  currency: string;
  code: string;
  rate: number;
}

interface ExchangeRateData {
  rates: ExchangeRate[];
  updatedAt: string;
}

const FALLBACK: ExchangeRateData = {
  rates: [
    { currency: "미국 달러", code: "USD", rate: 1380.0 },
    { currency: "유럽연합 유로", code: "EUR", rate: 1500.0 },
    { currency: "일본 엔(100)", code: "JPY", rate: 920.0 },
    { currency: "중국 위안", code: "CNY", rate: 190.0 },
    { currency: "영국 파운드", code: "GBP", rate: 1740.0 },
  ],
  updatedAt: "2026-04-01",
};

const TARGET_CURRENCIES = ["USD", "EUR", "JPY", "CNY", "GBP"];

function loadPreviousData(): ExchangeRateData | null {
  if (!existsSync(OUTPUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

async function fetchRates(): Promise<ExchangeRate[] | null> {
  try {
    const API_KEY = process.env.KOREAEXIM_API_KEY;
    if (!API_KEY) {
      console.warn("KOREAEXIM_API_KEY not set, using fallback");
      return null;
    }
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${API_KEY}&searchdate=${today}&data=AP01`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;

    return data
      .filter((item: { cur_unit: string }) =>
        TARGET_CURRENCIES.some((c) => item.cur_unit.startsWith(c))
      )
      .map((item: { cur_nm: string; cur_unit: string; deal_bas_r: string }) => ({
        currency: item.cur_nm,
        code: item.cur_unit.replace(/\(100\)/, "").trim(),
        rate: parseFloat(item.deal_bas_r.replace(/,/g, "")),
      }));
  } catch (e) {
    console.warn("Failed to fetch exchange rates:", e);
    return null;
  }
}

async function main() {
  const previous = loadPreviousData();
  const rates = await fetchRates();

  const result: ExchangeRateData = {
    rates: rates ?? previous?.rates ?? FALLBACK.rates,
    updatedAt: new Date().toISOString().split("T")[0],
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log("Exchange rates saved:", OUTPUT_PATH);
}

main().catch(console.error);
