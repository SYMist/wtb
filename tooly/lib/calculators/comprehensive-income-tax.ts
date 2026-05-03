import {
  ANNUAL_INCOME_TAX_BRACKETS,
  LOCAL_INCOME_TAX_RATE,
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
  STANDARD_TAX_CREDIT,
  EARNED_STANDARD_TAX_CREDIT,
} from "@/lib/data/tax-rates";

export interface ComprehensiveIncomeTaxInput {
  laborIncome: number;         // 근로소득 총급여 (연간)
  businessIncome: number;      // 사업소득 수입금액 (연간)
  businessExpenseRate: number; // 사업소득 필요경비율 (0~1, e.g. 0.6 = 60%)
  otherIncome: number;         // 기타소득 총수입금액 (강연료/원고료 등, 연간)
  dependents: number;          // 인적공제 인원 (본인 포함)
  children: number;            // 자녀세액공제 대상 자녀 수
  pensionPaid: number;         // 국민/개인연금 납입액 (연간)
  prepaidTax: number;          // 기납부세액(원천징수액, 연간)
}

export interface ComprehensiveIncomeTaxResult {
  // 소득 분해
  laborIncomeAmount: number;    // 근로소득금액 (공제 후)
  businessIncomeAmount: number; // 사업소득금액 (경비 제외)
  otherIncomeAmount: number;    // 기타소득금액 (필요경비 60% 제외)
  totalIncome: number;          // 종합소득금액
  // 공제
  personalDeduction: number;   // 인적공제
  pensionDeduction: number;    // 연금보험료공제
  totalDeduction: number;      // 소득공제 합계
  // 세액
  taxBase: number;              // 과세표준
  calculatedTax: number;        // 산출세액
  taxCredit: number;            // 세액공제 합계
  determinedTax: number;        // 결정세액 (소득세)
  localTax: number;             // 지방소득세
  totalTax: number;             // 총세금 (소득세 + 지방소득세)
  // 최종
  payOrRefund: number;          // 납부(+) or 환급(-) 세액
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

function calcAnnualTax(taxBase: number): number {
  for (let i = ANNUAL_INCOME_TAX_BRACKETS.length - 1; i >= 0; i--) {
    const b = ANNUAL_INCOME_TAX_BRACKETS[i];
    if (taxBase > b.min) {
      return Math.round(taxBase * b.rate - b.progressiveDeduction);
    }
  }
  return 0;
}

function calcEarnedIncomeCredit(calculatedTax: number, laborIncome: number): number {
  let credit: number;
  if (calculatedTax <= EMPLOYMENT_TAX_CREDIT_THRESHOLD) {
    credit = Math.round(calculatedTax * EMPLOYMENT_TAX_CREDIT_LOW_RATE);
  } else {
    credit = Math.round(
      EMPLOYMENT_TAX_CREDIT_HIGH_BASE +
      (calculatedTax - EMPLOYMENT_TAX_CREDIT_THRESHOLD) * EMPLOYMENT_TAX_CREDIT_HIGH_RATE
    );
  }
  const creditLimit =
    laborIncome <= EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD
      ? EMPLOYMENT_TAX_CREDIT_LIMIT_BASE
      : Math.max(
          EMPLOYMENT_TAX_CREDIT_LIMIT_MIN,
          EMPLOYMENT_TAX_CREDIT_LIMIT_BASE -
            Math.round((laborIncome - EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD) * EMPLOYMENT_TAX_CREDIT_LIMIT_RATE)
        );
  return Math.min(credit, creditLimit);
}

export function calculateComprehensiveIncomeTax(
  input: ComprehensiveIncomeTaxInput
): ComprehensiveIncomeTaxResult {
  const {
    laborIncome,
    businessIncome,
    businessExpenseRate,
    otherIncome,
    dependents,
    children,
    pensionPaid,
    prepaidTax,
  } = input;

  // 1. 각 소득금액 계산
  const laborIncomeAmount = laborIncome > 0
    ? Math.max(laborIncome - calcEmploymentIncomeDeduction(laborIncome), 0)
    : 0;
  const businessIncomeAmount = Math.max(
    Math.round(businessIncome * (1 - businessExpenseRate)),
    0
  );
  // 기타소득: 필요경비 60% → 소득금액은 40%
  // 단, 기타소득금액이 연 300만원 초과 시 종합과세 (이하면 분리과세 선택 가능이나 여기선 종합과세 기준)
  const otherIncomeAmount = Math.max(Math.round(otherIncome * 0.4), 0);
  const totalIncome = laborIncomeAmount + businessIncomeAmount + otherIncomeAmount;

  // 2. 소득공제
  const personalDeduction = dependents * DEPENDENT_DEDUCTION;
  const pensionDeduction = pensionPaid;
  const totalDeduction = personalDeduction + pensionDeduction;

  // 3. 과세표준
  const taxBase = Math.max(totalIncome - totalDeduction, 0);

  // 4. 산출세액
  const calculatedTax = calcAnnualTax(taxBase);

  // 5. 세액공제
  let taxCredit = 0;
  if (laborIncome > 0) {
    // 근로소득이 있으면 근로소득세액공제
    taxCredit += calcEarnedIncomeCredit(calculatedTax, laborIncome);
    taxCredit += EARNED_STANDARD_TAX_CREDIT;
  } else {
    // 근로소득 없으면 표준세액공제
    taxCredit += STANDARD_TAX_CREDIT;
  }
  // 자녀세액공제
  taxCredit += children * CHILD_DEDUCTION;

  // 6. 결정세액
  const determinedTax = Math.max(calculatedTax - taxCredit, 0);
  const localTax = Math.round(determinedTax * LOCAL_INCOME_TAX_RATE);
  const totalTax = determinedTax + localTax;

  // 7. 납부/환급 (+ = 납부, - = 환급)
  const payOrRefund = totalTax - prepaidTax;

  return {
    laborIncomeAmount,
    businessIncomeAmount,
    otherIncomeAmount,
    totalIncome,
    personalDeduction,
    pensionDeduction,
    totalDeduction,
    taxBase,
    calculatedTax,
    taxCredit,
    determinedTax,
    localTax,
    totalTax,
    payOrRefund,
  };
}
