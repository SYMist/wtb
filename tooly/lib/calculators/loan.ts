export interface LoanInput {
  principal: number; // 대출 원금
  annualRate: number; // 연이자율 (%)
  termYears: number; // 대출기간 (년)
  gracePeriodYears: number; // 거치기간 (년)
}

export interface MonthlyScheduleItem {
  month: number;
  principal: number;
  interest: number;
  payment: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: MonthlyScheduleItem[];
}

/** 원리금균등 상환 */
export function calcEqualPayment(input: LoanInput): LoanResult {
  const { principal, annualRate, termYears, gracePeriodYears } = input;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const graceMonths = gracePeriodYears * 12;
  const repayMonths = totalMonths - graceMonths;

  const schedule: MonthlyScheduleItem[] = [];
  let balance = principal;

  // 거치기간: 이자만 납부
  for (let m = 1; m <= graceMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    schedule.push({ month: m, principal: 0, interest, payment: interest, balance });
  }

  // 상환기간: 원리금균등
  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = Math.round(principal / repayMonths);
  } else {
    monthlyPayment = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, repayMonths)) /
        (Math.pow(1 + monthlyRate, repayMonths) - 1)
    );
  }

  for (let m = graceMonths + 1; m <= totalMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({
      month: m,
      principal: principalPaid,
      interest,
      payment: principalPaid + interest,
      balance,
    });
  }

  const totalPayment = schedule.reduce((s, i) => s + i.payment, 0);
  const totalInterest = totalPayment - principal;

  return { monthlyPayment, totalPayment, totalInterest, schedule };
}

/** 원금균등 상환 */
export function calcEqualPrincipal(input: LoanInput): LoanResult {
  const { principal, annualRate, termYears, gracePeriodYears } = input;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  const graceMonths = gracePeriodYears * 12;
  const repayMonths = totalMonths - graceMonths;

  const schedule: MonthlyScheduleItem[] = [];
  let balance = principal;
  const monthlyPrincipal = Math.round(principal / repayMonths);

  for (let m = 1; m <= graceMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    schedule.push({ month: m, principal: 0, interest, payment: interest, balance });
  }

  for (let m = graceMonths + 1; m <= totalMonths; m++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPaid = m === totalMonths ? balance : Math.min(monthlyPrincipal, balance);
    balance = Math.max(balance - principalPaid, 0);
    schedule.push({
      month: m,
      principal: principalPaid,
      interest,
      payment: principalPaid + interest,
      balance,
    });
  }

  const totalPayment = schedule.reduce((s, i) => s + i.payment, 0);
  const firstRepayPayment = schedule[graceMonths]?.payment ?? 0;

  return {
    monthlyPayment: firstRepayPayment,
    totalPayment,
    totalInterest: totalPayment - principal,
    schedule,
  };
}

/** 만기일시 상환 */
export function calcBulletPayment(input: LoanInput): LoanResult {
  const { principal, annualRate, termYears } = input;
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;

  const monthlyInterest = Math.round(principal * monthlyRate);
  const schedule: MonthlyScheduleItem[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    const isLast = m === totalMonths;
    schedule.push({
      month: m,
      principal: isLast ? principal : 0,
      interest: monthlyInterest,
      payment: isLast ? principal + monthlyInterest : monthlyInterest,
      balance: isLast ? 0 : principal,
    });
  }

  const totalPayment = monthlyInterest * totalMonths + principal;

  return {
    monthlyPayment: monthlyInterest,
    totalPayment,
    totalInterest: monthlyInterest * totalMonths,
    schedule,
  };
}

/** DSR 계산 */
export function calcDSR(annualRepayment: number, annualIncome: number): number {
  if (annualIncome <= 0) return 0;
  return (annualRepayment / annualIncome) * 100;
}
