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

  return {
    totalDays,
    years,
    months,
    days,
    dailyWage,
    severancePay,
  };
}
