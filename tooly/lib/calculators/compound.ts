export interface CompoundForwardInput {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturnRate: number; // %
  years: number;
  inflationRate?: number; // %
}

export interface CompoundReverseInput {
  targetAmount: number;
  years: number;
  annualReturnRate?: number; // % - 수익률 or 월적립액 중 하나 제공
  monthlyContribution?: number;
}

export interface YearlyData {
  year: number;
  totalInvested: number;
  totalValue: number;
  earnings: number;
  realValue?: number;
}

export interface CompoundForwardResult {
  finalAmount: number;
  totalInvested: number;
  totalEarnings: number;
  returnRate: number;
  yearlyData: YearlyData[];
  // 거치식 비교
  lumpSumFinal?: number;
  lumpSumEarnings?: number;
}

export interface CompoundReverseResult {
  requiredMonthly?: number;
  requiredRate?: number;
}

/** 적립식 복리 계산 (정방향) */
export function calcCompoundForward(
  input: CompoundForwardInput
): CompoundForwardResult {
  const { initialInvestment, monthlyContribution, annualReturnRate, years, inflationRate } = input;
  const monthlyRate = annualReturnRate / 100 / 12;
  const totalMonths = years * 12;

  const yearlyData: YearlyData[] = [];

  let currentValue = initialInvestment;
  for (let m = 1; m <= totalMonths; m++) {
    currentValue = currentValue * (1 + monthlyRate) + monthlyContribution;
    if (m % 12 === 0) {
      const year = m / 12;
      const totalInvested = initialInvestment + monthlyContribution * m;
      const entry: YearlyData = {
        year,
        totalInvested,
        totalValue: Math.round(currentValue),
        earnings: Math.round(currentValue - totalInvested),
      };
      if (inflationRate && inflationRate > 0) {
        entry.realValue = Math.round(
          currentValue / Math.pow(1 + inflationRate / 100, year)
        );
      }
      yearlyData.push(entry);
    }
  }

  const totalInvested = initialInvestment + monthlyContribution * totalMonths;
  const finalAmount = Math.round(currentValue);
  const totalEarnings = finalAmount - totalInvested;

  // 거치식 비교
  const lumpSumFinal = Math.round(
    initialInvestment * Math.pow(1 + monthlyRate, totalMonths)
  );
  const lumpSumEarnings = lumpSumFinal - initialInvestment;

  return {
    finalAmount,
    totalInvested,
    totalEarnings,
    returnRate: totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0,
    yearlyData,
    lumpSumFinal,
    lumpSumEarnings,
  };
}

/** 역방향: 필요 월 적립액 계산 */
export function calcRequiredMonthly(
  targetAmount: number,
  years: number,
  annualReturnRate: number,
  initialInvestment: number = 0
): number {
  const monthlyRate = annualReturnRate / 100 / 12;
  const totalMonths = years * 12;

  if (monthlyRate === 0) {
    return Math.round((targetAmount - initialInvestment) / totalMonths);
  }

  const fvInitial = initialInvestment * Math.pow(1 + monthlyRate, totalMonths);
  const remaining = targetAmount - fvInitial;
  const factor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;

  return Math.max(Math.round(remaining / factor), 0);
}

/** 역방향: 필요 수익률 계산 (이진탐색) */
export function calcRequiredRate(
  targetAmount: number,
  years: number,
  monthlyContribution: number,
  initialInvestment: number = 0
): number {
  let low = 0;
  let high = 100;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const result = calcCompoundForward({
      initialInvestment,
      monthlyContribution,
      annualReturnRate: mid,
      years,
    });
    if (result.finalAmount < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round(((low + high) / 2) * 100) / 100;
}
