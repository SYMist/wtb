import {
  CAPITAL_GAINS_TAX_BRACKETS,
  LONG_TERM_HOLDING_DEDUCTION,
  LOCAL_INCOME_TAX_RATE,
} from "@/lib/data/tax-rates";

export interface CapitalGainsTaxInput {
  acquisitionPrice: number; // 취득가액
  sellingPrice: number; // 양도가액
  holdingYears: number; // 보유기간 (년)
  isSingleHome: boolean; // 1세대1주택 여부
  expenses: number; // 필요경비
}

export interface CapitalGainsTaxResult {
  gain: number; // 양도차익
  longTermDeductionRate: number; // 장기보유 특별공제율
  longTermDeduction: number; // 장기보유 특별공제액
  taxBase: number; // 과세표준
  taxRate: number; // 적용 세율
  capitalGainsTax: number; // 양도소득세
  localTax: number; // 지방소득세
  totalTax: number; // 총 세금
  netProfit: number; // 세후 순수익
}

export function calculateCapitalGainsTax(
  input: CapitalGainsTaxInput
): CapitalGainsTaxResult {
  const { acquisitionPrice, sellingPrice, holdingYears, isSingleHome, expenses } = input;

  const gain = Math.max(sellingPrice - acquisitionPrice - expenses, 0);

  // 1세대1주택 비과세 (2년 이상 보유, 양도가 12억 이하)
  if (isSingleHome && holdingYears >= 2 && sellingPrice <= 1_200_000_000) {
    return {
      gain,
      longTermDeductionRate: 0,
      longTermDeduction: 0,
      taxBase: 0,
      taxRate: 0,
      capitalGainsTax: 0,
      localTax: 0,
      totalTax: 0,
      netProfit: gain,
    };
  }

  // 장기보유 특별공제
  let longTermDeductionRate = 0;
  if (holdingYears >= 3) {
    const cappedYears = Math.min(holdingYears, 15);
    longTermDeductionRate = LONG_TERM_HOLDING_DEDUCTION[cappedYears] ?? 0.30;
  }
  // 1세대1주택 추가 공제 (최대 80%)
  if (isSingleHome && holdingYears >= 3) {
    longTermDeductionRate = Math.min(holdingYears * 0.08, 0.80);
  }

  const longTermDeduction = Math.round(gain * longTermDeductionRate);
  const basicDeduction = 2_500_000; // 기본공제 250만원
  const taxBase = Math.max(gain - longTermDeduction - basicDeduction, 0);

  // 누진세율 적용
  let capitalGainsTax = 0;
  let appliedRate = 0;
  for (const bracket of CAPITAL_GAINS_TAX_BRACKETS) {
    if (taxBase > bracket.min) {
      capitalGainsTax = Math.round(taxBase * bracket.rate - bracket.deduction);
      appliedRate = bracket.rate;
    }
  }

  const localTax = Math.round(capitalGainsTax * LOCAL_INCOME_TAX_RATE);
  const totalTax = capitalGainsTax + localTax;

  return {
    gain,
    longTermDeductionRate: longTermDeductionRate * 100,
    longTermDeduction,
    taxBase,
    taxRate: appliedRate * 100,
    capitalGainsTax,
    localTax,
    totalTax,
    netProfit: gain - totalTax,
  };
}
