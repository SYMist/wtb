export interface SeveranceInput {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  recentMonthlyPay: number; // 최근 3개월 월평균 급여
}

export interface SeveranceResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  dailyWage: number;
  severancePay: number;
  // 퇴직소득세
  yearsRounded: number;
  serviceYearDeduction: number;
  retirementIncome: number;
  convertedWage: number;
  convertedWageDeduction: number;
  convertedTaxBase: number;
  retirementTax: number;
  localTax: number;
  netSeverancePay: number;
}

function calcServiceYearDeduction(years: number): number {
  if (years <= 5) return 1_000_000 * years;
  if (years <= 10) return 5_000_000 + 2_000_000 * (years - 5);
  if (years <= 20) return 15_000_000 + 2_500_000 * (years - 10);
  return 40_000_000 + 3_000_000 * (years - 20);
}

function calcConvertedWageDeduction(wage: number): number {
  if (wage <= 8_000_000) return wage;
  if (wage <= 70_000_000) return 8_000_000 + (wage - 8_000_000) * 0.6;
  if (wage <= 100_000_000) return 45_200_000 + (wage - 70_000_000) * 0.55;
  if (wage <= 300_000_000) return 62_700_000 + (wage - 100_000_000) * 0.45;
  return 152_700_000 + (wage - 300_000_000) * 0.35;
}

function calcIncomeTax(taxBase: number): number {
  if (taxBase <= 14_000_000) return taxBase * 0.06;
  if (taxBase <= 50_000_000) return 840_000 + (taxBase - 14_000_000) * 0.15;
  if (taxBase <= 88_000_000) return 6_240_000 + (taxBase - 50_000_000) * 0.24;
  if (taxBase <= 150_000_000) return 15_360_000 + (taxBase - 88_000_000) * 0.35;
  if (taxBase <= 300_000_000) return 37_060_000 + (taxBase - 150_000_000) * 0.38;
  if (taxBase <= 500_000_000) return 94_060_000 + (taxBase - 300_000_000) * 0.4;
  if (taxBase <= 1_000_000_000) return 174_060_000 + (taxBase - 500_000_000) * 0.42;
  return 384_060_000 + (taxBase - 1_000_000_000) * 0.45;
}

export function calculateSeverance(input: SeveranceInput): SeveranceResult {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const totalDays = Math.max(
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = totalDays % 30;

  // 1일 평균임금 = 최근 3개월 급여 총액 / 해당 일수(약 91일)
  const dailyWage = Math.round((input.recentMonthlyPay * 3) / 91);

  // 퇴직금 = 1일 평균임금 × 30일 × (근속일수/365)
  const severancePay = Math.round((dailyWage * 30 * totalDays) / 365);

  // 퇴직소득세 계산 (소득세법 제48조, 제55조)
  // 근속연수: 1년 미만 기간은 1년으로 올림
  const yearsRounded = Math.max(Math.ceil(totalDays / 365), 1);

  const serviceYearDeduction = calcServiceYearDeduction(yearsRounded);
  const retirementIncome = Math.max(severancePay - serviceYearDeduction, 0);

  // 환산급여 = 퇴직소득금액 × 12 / 근속연수
  const convertedWage = (retirementIncome * 12) / yearsRounded;
  const convertedWageDeduction = calcConvertedWageDeduction(convertedWage);

  // 환산과세표준
  const convertedTaxBase = Math.max(convertedWage - convertedWageDeduction, 0);

  // 산출세액 = 환산산출세액 × 근속연수 / 12
  const convertedTax = calcIncomeTax(convertedTaxBase);
  const retirementTax = Math.round((convertedTax * yearsRounded) / 12);
  const localTax = Math.round(retirementTax * 0.1);
  const netSeverancePay = severancePay - retirementTax - localTax;

  return {
    totalDays,
    years,
    months,
    days,
    dailyWage,
    severancePay,
    yearsRounded,
    serviceYearDeduction,
    retirementIncome,
    convertedWage,
    convertedWageDeduction,
    convertedTaxBase,
    retirementTax,
    localTax,
    netSeverancePay,
  };
}
