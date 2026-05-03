/**
 * 환율 계산기용 최신 환율 스냅샷 생성
 * USD/JPY/CNY/EUR: 기존 ECOS series JSON에서 latest 값 읽기
 * GBP: ECOS 731Y004 item 0000012 직접 fetch
 *
 * 실행: npx tsx --env-file=.env.local scripts/fetch-exchange-rates.ts
 * 필요 환경변수: ECOS_API_KEY
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

interface SeriesJson {
  latest: { date: string; rate: number };
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

function readSeriesLatest(filename: string): number | null {
  const path = join(__dirname, "../lib/data", filename);
  if (!existsSync(path)) return null;
  try {
    const json = JSON.parse(readFileSync(path, "utf-8")) as SeriesJson;
    return json.latest?.rate ?? null;
  } catch {
    return null;
  }
}

async function fetchGbpRate(): Promise<number | null> {
  const API_KEY = process.env.ECOS_API_KEY ?? process.env.BOK_API_KEY;
  if (!API_KEY) {
    console.warn("ECOS_API_KEY not set, using fallback for GBP");
    return null;
  }
  try {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const start = `${now.getFullYear() - 1}01`;
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${API_KEY}/json/kr/1/24/731Y004/M/${start}/${ym}/0000012/0000100`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.RESULT) return null;
    const rows: Array<{ TIME: string; DATA_VALUE: string }> =
      data?.StatisticSearch?.row ?? [];
    if (rows.length === 0) return null;
    const sorted = rows.sort((a, b) => b.TIME.localeCompare(a.TIME));
    return parseFloat(sorted[0].DATA_VALUE);
  } catch (e) {
    console.warn("Failed to fetch GBP rate:", e);
    return null;
  }
}

function loadPreviousData(): ExchangeRateData | null {
  if (!existsSync(OUTPUT_PATH)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

async function main() {
  const previous = loadPreviousData();

  const usd = readSeriesLatest("usdkrw-rate-series.json");
  const jpy = readSeriesLatest("jpykrw-rate-series.json");
  const cny = readSeriesLatest("cnykrw-rate-series.json");
  const eur = readSeriesLatest("eurkrw-rate-series.json");
  const gbp = await fetchGbpRate();

  const prevRates = previous?.rates ?? FALLBACK.rates;
  const findPrev = (code: string) => prevRates.find((r) => r.code === code)?.rate;

  const rates: ExchangeRate[] = [
    { currency: "미국 달러", code: "USD", rate: usd ?? findPrev("USD") ?? FALLBACK.rates[0].rate },
    { currency: "유럽연합 유로", code: "EUR", rate: eur ?? findPrev("EUR") ?? FALLBACK.rates[1].rate },
    { currency: "일본 엔(100)", code: "JPY", rate: jpy ?? findPrev("JPY") ?? FALLBACK.rates[2].rate },
    { currency: "중국 위안", code: "CNY", rate: cny ?? findPrev("CNY") ?? FALLBACK.rates[3].rate },
    { currency: "영국 파운드", code: "GBP", rate: gbp ?? findPrev("GBP") ?? FALLBACK.rates[4].rate },
  ];

  const today = new Date().toISOString().split("T")[0];
  const result: ExchangeRateData = { rates, updatedAt: today };

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log("Exchange rates saved:", rates.map((r) => `${r.code}=${r.rate}`).join(", "));
}

main().catch(console.error);
