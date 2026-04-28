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
  EMPLOYMENT_INCOME_DEDUCTION_BRACKETS,
  EMPLOYMENT_INCOME_DEDUCTION_MAX,
  EMPLOYMENT_TAX_CREDIT_THRESHOLD,
  EMPLOYMENT_TAX_CREDIT_LOW_RATE,
  EMPLOYMENT_TAX_CREDIT_HIGH_BASE,
  EMPLOYMENT_TAX_CREDIT_HIGH_RATE,
  EMPLOYMENT_TAX_CREDIT_LIMIT_BASE,
  EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD,
  EMPLOYMENT_TAX_CREDIT_LIMIT_RATE,
  EMPLOYMENT_TAX_CREDIT_LIMIT_MIN,
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

function calcEmploymentIncomeDeduction(annualSalary: number): number {
  for (const bracket of EMPLOYMENT_INCOME_DEDUCTION_BRACKETS) {
    if (annualSalary <= bracket.max) {
      const deduction = bracket.base + (annualSalary - bracket.min) * bracket.rate;
      return Math.min(Math.round(deduction), EMPLOYMENT_INCOME_DEDUCTION_MAX);
    }
  }
  return EMPLOYMENT_INCOME_DEDUCTION_MAX;
}

function calcIncomeTax(
  annualTaxable: number,  // 총급여 (연간)
  nationalPensionAnnual: number,
  healthInsuranceAnnual: number,
  longTermCareAnnual: number,
  employmentInsuranceAnnual: number,
  dependents: number,
  children: number
): number {
  // 1. 근로소득공제 → 근로소득금액
  const earnedIncome = annualTaxable - calcEmploymentIncomeDeduction(annualTaxable);

  // 2. 인적공제 + 연금보험료공제 + 특별소득공제(건강/장기요양/고용보험)
  const personalDeduction = dependents * DEPENDENT_DEDUCTION;
  const specialDeduction = nationalPensionAnnual + healthInsuranceAnnual + longTermCareAnnual + employmentInsuranceAnnual;

  // 3. 과세표준
  const taxBase = Math.max(earnedIncome - personalDeduction - specialDeduction, 0);

  // 4. 산출세액 (월 과세표준 기준 간이세액표 방식)
  const monthlyTaxBase = taxBase / 12;
  let annualCalculatedTax = 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (monthlyTaxBase > bracket.min) {
      annualCalculatedTax = Math.max(
        Math.round((monthlyTaxBase * bracket.rate - bracket.deduction) * 12),
        0
      );
    }
  }

  // 5. 근로소득세액공제
  let taxCredit: number;
  if (annualCalculatedTax <= EMPLOYMENT_TAX_CREDIT_THRESHOLD) {
    taxCredit = Math.round(annualCalculatedTax * EMPLOYMENT_TAX_CREDIT_LOW_RATE);
  } else {
    taxCredit = Math.round(
      EMPLOYMENT_TAX_CREDIT_HIGH_BASE +
      (annualCalculatedTax - EMPLOYMENT_TAX_CREDIT_THRESHOLD) * EMPLOYMENT_TAX_CREDIT_HIGH_RATE
    );
  }
  const creditLimit =
    annualTaxable <= EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD
      ? EMPLOYMENT_TAX_CREDIT_LIMIT_BASE
      : Math.max(
          EMPLOYMENT_TAX_CREDIT_LIMIT_MIN,
          EMPLOYMENT_TAX_CREDIT_LIMIT_BASE -
            Math.round((annualTaxable - EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD) * EMPLOYMENT_TAX_CREDIT_LIMIT_RATE)
        );
  taxCredit = Math.min(taxCredit, creditLimit);

  // 6. 자녀세액공제
  const childCredit = children * CHILD_DEDUCTION;

  // 7. 결정세액 → 월 소득세
  const finalAnnualTax = Math.max(annualCalculatedTax - taxCredit - childCredit, 0);
  return Math.round(finalAnnualTax / 12);
}

export function calculateSalary(input: SalaryInput): SalaryResult {
  const monthlySalary = Math.round(input.annualSalary / 12);
  const taxableMonthly = Math.max(monthlySalary - input.nonTaxableAmount, 0);
  const annualTaxable = taxableMonthly * 12;

  const nationalPension = calcNationalPension(taxableMonthly);
  const healthInsurance = calcHealthInsurance(taxableMonthly);
  const longTermCare = calcLongTermCare(healthInsurance);
  const employmentInsurance = calcEmploymentInsurance(taxableMonthly);
  const incomeTax = calcIncomeTax(
    annualTaxable,
    nationalPension * 12,
    healthInsurance * 12,
    longTermCare * 12,
    employmentInsurance * 12,
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
