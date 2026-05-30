import {
  CAPITAL_GAINS_TAX_BRACKETS,
  LONG_TERM_HOLDING_DEDUCTION,
  LOCAL_INCOME_TAX_RATE,
} from "@/lib/data/tax-rates";

/** 1세대 1주택 고가주택 기준 (양도가액) */
export const HIGH_VALUE_HOME_THRESHOLD = 1_200_000_000; // 12억

export interface CapitalGainsTaxInput {
  acquisitionPrice: number; // 취득가액
  sellingPrice: number; // 양도가액
  holdingYears: number; // 보유기간 (년)
  isSingleHome: boolean; // 1세대1주택 여부
  expenses: number; // 필요경비
  residenceYears?: number; // 거주기간 (1세대1주택 장특공 표2용, 미지정 시 보유기간으로 간주)
}

export interface CapitalGainsTaxResult {
  gain: number; // 전체 양도차익
  isExempt: boolean; // 전액 비과세 여부
  isHighValueSingleHome: boolean; // 1세대1주택 고가주택 안분과세 여부
  highValueRatio: number; // 과세대상 비율 (고가주택 안분, 0~1)
  taxableGain: number; // 과세대상 양도차익 (안분 후)
  longTermDeductionRate: number; // 장기보유 특별공제율 (%)
  longTermDeduction: number; // 장기보유 특별공제액
  basicDeduction: number; // 기본공제액
  taxBase: number; // 과세표준
  taxRate: number; // 적용 한계세율 (%)
  capitalGainsTax: number; // 양도소득세
  localTax: number; // 지방소득세
  totalTax: number; // 총 세금
  netProfit: number; // 세후 순수익
}

const BASIC_DEDUCTION = 2_500_000; // 양도소득 기본공제 250만원

export function calculateCapitalGainsTax(
  input: CapitalGainsTaxInput
): CapitalGainsTaxResult {
  const { acquisitionPrice, sellingPrice, holdingYears, isSingleHome, expenses } =
    input;
  const residenceYears = input.residenceYears ?? holdingYears;

  const gain = Math.max(sellingPrice - acquisitionPrice - expenses, 0);

  // 1세대 1주택 비과세 요건: 2년 이상 보유 (조정대상지역은 2년 거주 별도 — 본 계산기는 미반영)
  const meetsSingleHomeExemption = isSingleHome && holdingYears >= 2;

  // 전액 비과세 (양도가액 12억 이하)
  if (meetsSingleHomeExemption && sellingPrice <= HIGH_VALUE_HOME_THRESHOLD) {
    return {
      gain,
      isExempt: true,
      isHighValueSingleHome: false,
      highValueRatio: 0,
      taxableGain: 0,
      longTermDeductionRate: 0,
      longTermDeduction: 0,
      basicDeduction: 0,
      taxBase: 0,
      taxRate: 0,
      capitalGainsTax: 0,
      localTax: 0,
      totalTax: 0,
      netProfit: gain,
    };
  }

  // 고가주택 안분: 1세대 1주택이지만 양도가액 12억 초과 시,
  // 12억 초과분에 해당하는 양도차익만 과세
  // 과세 양도차익 = 전체 양도차익 × (양도가액 - 12억) / 양도가액
  let highValueRatio = 1;
  const isHighValueSingleHome =
    meetsSingleHomeExemption && sellingPrice > HIGH_VALUE_HOME_THRESHOLD;
  if (isHighValueSingleHome) {
    highValueRatio = (sellingPrice - HIGH_VALUE_HOME_THRESHOLD) / sellingPrice;
  }
  const taxableGain = Math.round(gain * highValueRatio);

  // 장기보유 특별공제
  let longTermDeductionRate = 0;
  if (meetsSingleHomeExemption && holdingYears >= 3 && residenceYears >= 2) {
    // 표2 (1세대 1주택): 보유 연 4%(최대 40%) + 거주 연 4%(최대 40%), 합산 최대 80%
    const holdRate = Math.min(holdingYears, 10) * 0.04;
    const liveRate = Math.min(residenceYears, 10) * 0.04;
    longTermDeductionRate = Math.min(holdRate + liveRate, 0.8);
  } else if (holdingYears >= 3) {
    // 표1 (일반): 보유 3년 6% ~ 15년 이상 최대 30%
    const cappedYears = Math.min(holdingYears, 15);
    longTermDeductionRate = LONG_TERM_HOLDING_DEDUCTION[cappedYears] ?? 0.3;
  }

  const longTermDeduction = Math.round(taxableGain * longTermDeductionRate);
  const taxBase = Math.max(taxableGain - longTermDeduction - BASIC_DEDUCTION, 0);

  // 기본 누진세율 적용 (다주택 중과세율은 정책에 따라 한시 배제·변동되므로 미반영)
  let capitalGainsTax = 0;
  let appliedRate = 0;
  for (const bracket of CAPITAL_GAINS_TAX_BRACKETS) {
    if (taxBase > bracket.min) {
      capitalGainsTax = Math.round(taxBase * bracket.rate - bracket.deduction);
      appliedRate = bracket.rate;
    }
  }
  capitalGainsTax = Math.max(capitalGainsTax, 0);

  const localTax = Math.round(capitalGainsTax * LOCAL_INCOME_TAX_RATE);
  const totalTax = capitalGainsTax + localTax;

  return {
    gain,
    isExempt: false,
    isHighValueSingleHome,
    highValueRatio,
    taxableGain,
    longTermDeductionRate: longTermDeductionRate * 100,
    longTermDeduction,
    basicDeduction: BASIC_DEDUCTION,
    taxBase,
    taxRate: appliedRate * 100,
    capitalGainsTax,
    localTax,
    totalTax,
    netProfit: gain - totalTax,
  };
}
