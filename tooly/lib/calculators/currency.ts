import exchangeRates from "@/lib/data/exchange-rates.json";

export interface CurrencyRate {
  currency: string;
  code: string;
  rate: number;
}

export function getRates(): { rates: CurrencyRate[]; updatedAt: string } {
  return exchangeRates;
}

export function convert(
  amount: number,
  fromCode: string,
  toCode: string
): number {
  const rates = exchangeRates.rates;

  // KRW 기준으로 변환
  if (fromCode === "KRW" && toCode === "KRW") return amount;

  const getKRWRate = (code: string): number => {
    if (code === "KRW") return 1;
    const found = rates.find((r) => r.code === code);
    if (!found) return 1;
    // JPY는 100엔 기준
    if (code === "JPY") return found.rate / 100;
    return found.rate;
  };

  const fromKRW = getKRWRate(fromCode);
  const toKRW = getKRWRate(toCode);

  // amount in fromCode → KRW → toCode
  const krwAmount = amount * fromKRW;
  const result = krwAmount / toKRW;

  return Math.round(result * 100) / 100;
}

export const supportedCurrencies = [
  { code: "KRW", name: "한국 원" },
  { code: "USD", name: "미국 달러" },
  { code: "EUR", name: "유럽연합 유로" },
  { code: "JPY", name: "일본 엔" },
  { code: "CNY", name: "중국 위안" },
  { code: "GBP", name: "영국 파운드" },
];
