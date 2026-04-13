import { LEGAL_CONVERSION_RATE_ADDITION } from "@/lib/data/tax-rates";

export interface RentConversionInput {
  deposit: number; // 보증금
  monthlyRent: number; // 월세
  conversionRate: number; // 전환율 (%)
}

export interface RentConversionResult {
  fullJeonse: number; // 전세 환산 보증금 (보증금 + 월세를 보증금으로)
  monthlyFromDeposit: number; // 보증금을 월세로 환산한 금액
  legalRate: number; // 법정 전환율
}

export function getLegalConversionRate(baseRate: number): number {
  return baseRate + LEGAL_CONVERSION_RATE_ADDITION;
}

export function calculateRentConversion(
  input: RentConversionInput
): RentConversionResult {
  const { deposit, monthlyRent, conversionRate } = input;
  const rate = conversionRate / 100;

  // 월세 → 보증금 환산: 월세 × 12 / 전환율
  const rentToDeposit = rate > 0 ? Math.round((monthlyRent * 12) / rate) : 0;
  const fullJeonse = deposit + rentToDeposit;

  // 보증금 → 월세 환산: 보증금 × 전환율 / 12
  const monthlyFromDeposit = Math.round((deposit * rate) / 12);

  return {
    fullJeonse,
    monthlyFromDeposit,
    legalRate: conversionRate,
  };
}
