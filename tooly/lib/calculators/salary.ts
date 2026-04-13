import {
  NATIONAL_PENSION_RATE,
  NATIONAL_PENSION_MIN_INCOME,
  NATIONAL_PENSION_MAX_INCOME,
  HEALTH_INSURANCE_RATE,
  LONG_TERM_CARE_RATE,
  EMPLOYMENT_INSURANCE_RATE,
  LOCAL_INCOME_TAX_RATE,
  INCOME_TAX_BRACKETS,
  DEPENDENT_DEDUCTION,
  CHILD_DEDUCTION,
} from "@/lib/data/tax-rates";

export interface SalaryInput {
  annualSalary: number;
  nonTaxableAmount: number;
  dependents: number; // 부양가족 수 (본인 포함)
  children: number; // 20세 이하 자녀 수
}

export interface DeductionItem {
  name: string;
  monthly: number;
  annual: number;
  rate: number;
}

export interface SalaryResult {
  monthlySalary: number;
  monthlyTakeHome: number;
  annualTakeHome: number;
  totalDeductionMonthly: number;
  totalDeductionAnnual: number;
  deductions: DeductionItem[];
}

function calcNationalPension(monthlyIncome: number): number {
  const base = Math.min(
    Math.max(monthlyIncome, NATIONAL_PENSION_MIN_INCOME),
    NATIONAL_PENSION_MAX_INCOME
  );
  return Math.round(base * NATIONAL_PENSION_RATE);
}

function calcHealthInsurance(monthlyIncome: number): number {
  return Math.round(monthlyIncome * HEALTH_INSURANCE_RATE);
}

function calcLongTermCare(healthInsurance: number): number {
  return Math.round(healthInsurance * LONG_TERM_CARE_RATE);
}

function calcEmploymentInsurance(monthlyIncome: number): number {
  return Math.round(monthlyIncome * EMPLOYMENT_INSURANCE_RATE);
}

function calcIncomeTax(
  monthlyIncome: number,
  nonTaxable: number,
  dependents: number,
  children: number
): number {
  const taxableMonthly = Math.max(monthlyIncome - nonTaxable, 0);
  const taxableAnnual = taxableMonthly * 12;

  // 인적공제
  const personalDeduction = dependents * DEPENDENT_DEDUCTION;
  const taxBase = Math.max(taxableAnnual - personalDeduction, 0);

  // 누진세율 적용
  const monthlyTaxBase = taxBase / 12;
  let tax = 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (monthlyTaxBase > bracket.min) {
      tax = Math.round(monthlyTaxBase * bracket.rate - bracket.deduction);
    }
  }

  // 자녀세액공제
  const childCredit = children * CHILD_DEDUCTION;
  tax = Math.max(tax - Math.round(childCredit / 12), 0);

  return Math.max(tax, 0);
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  const monthlySalary = Math.round(input.annualSalary / 12);
  const taxableMonthly = Math.max(
    monthlySalary - input.nonTaxableAmount,
    0
  );

  const nationalPension = calcNationalPension(taxableMonthly);
  const healthInsurance = calcHealthInsurance(taxableMonthly);
  const longTermCare = calcLongTermCare(healthInsurance);
  const employmentInsurance = calcEmploymentInsurance(taxableMonthly);
  const incomeTax = calcIncomeTax(
    monthlySalary,
    input.nonTaxableAmount,
    input.dependents,
    input.children
  );
  const localIncomeTax = Math.round(incomeTax * LOCAL_INCOME_TAX_RATE);

  const deductions: DeductionItem[] = [
    {
      name: "국민연금",
      monthly: nationalPension,
      annual: nationalPension * 12,
      rate: NATIONAL_PENSION_RATE * 100,
    },
    {
      name: "건강보험",
      monthly: healthInsurance,
      annual: healthInsurance * 12,
      rate: HEALTH_INSURANCE_RATE * 100,
    },
    {
      name: "장기요양보험",
      monthly: longTermCare,
      annual: longTermCare * 12,
      rate: HEALTH_INSURANCE_RATE * LONG_TERM_CARE_RATE * 100,
    },
    {
      name: "고용보험",
      monthly: employmentInsurance,
      annual: employmentInsurance * 12,
      rate: EMPLOYMENT_INSURANCE_RATE * 100,
    },
    {
      name: "소득세",
      monthly: incomeTax,
      annual: incomeTax * 12,
      rate: monthlySalary > 0 ? (incomeTax / monthlySalary) * 100 : 0,
    },
    {
      name: "지방소득세",
      monthly: localIncomeTax,
      annual: localIncomeTax * 12,
      rate: monthlySalary > 0 ? (localIncomeTax / monthlySalary) * 100 : 0,
    },
  ];

  const totalDeductionMonthly = deductions.reduce(
    (sum, d) => sum + d.monthly,
    0
  );
  const monthlyTakeHome = monthlySalary - totalDeductionMonthly;

  return {
    monthlySalary,
    monthlyTakeHome,
    annualTakeHome: monthlyTakeHome * 12,
    totalDeductionMonthly,
    totalDeductionAnnual: totalDeductionMonthly * 12,
    deductions,
  };
}

/** 연봉 구간별 실수령액 비교 데이터 생성 */
export function getSalaryComparison(
  annualSalary: number,
  input: Omit<SalaryInput, "annualSalary">
): { salary: number; takeHome: number; isCurrent: boolean }[] {
  const step = 10_000_000;
  const range = [-2, -1, 0, 1, 2];
  return range.map((offset) => {
    const salary = Math.max(annualSalary + offset * step, step);
    const result = calculateSalary({ ...input, annualSalary: salary });
    return {
      salary,
      takeHome: result.monthlyTakeHome,
      isCurrent: offset === 0,
    };
  });
}
