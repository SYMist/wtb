/** 2026년 기준 4대보험 요율 및 소득세 관련 데이터 */

export const YEAR = 2026;

// 국민연금
export const NATIONAL_PENSION_RATE = 0.045; // 4.5%
export const NATIONAL_PENSION_MIN_INCOME = 390_000; // 하한액
export const NATIONAL_PENSION_MAX_INCOME = 6_170_000; // 상한액

// 건강보험
export const HEALTH_INSURANCE_RATE = 0.03545; // 3.545%

// 장기요양보험 (건강보험료의 %)
export const LONG_TERM_CARE_RATE = 0.1295; // 12.95%

// 고용보험
export const EMPLOYMENT_INSURANCE_RATE = 0.009; // 0.9%

// 지방소득세 (소득세의 %)
export const LOCAL_INCOME_TAX_RATE = 0.1; // 10%

// 소득세 간이세액표 (월 근로소득 기준, 부양가족 1인 기준 근사)
// 실제로는 국세청 간이세액표를 사용해야 하지만, 계산용 근사 로직 사용
export const INCOME_TAX_BRACKETS = [
  { min: 0, max: 1_000_000, rate: 0.06, deduction: 0 },
  { min: 1_000_000, max: 1_500_000, rate: 0.06, deduction: 0 },
  { min: 1_500_000, max: 3_000_000, rate: 0.06, deduction: 0 },
  { min: 3_000_000, max: 5_000_000, rate: 0.15, deduction: 108_000 },
  { min: 5_000_000, max: 7_000_000, rate: 0.24, deduction: 522_000 },
  { min: 7_000_000, max: 10_000_000, rate: 0.35, deduction: 1_490_000 },
  { min: 10_000_000, max: 16_666_667, rate: 0.38, deduction: 1_940_000 },
  { min: 16_666_667, max: Infinity, rate: 0.40, deduction: 2_540_000 },
];

// 부양가족 공제
export const DEPENDENT_DEDUCTION = 1_500_000; // 연 150만원 (인적공제)
export const CHILD_DEDUCTION = 150_000; // 연 15만원 (자녀세액공제)

// 법정 전월세 전환율 (한국은행 기준금리 + 가산율 2%)
export const LEGAL_CONVERSION_RATE_ADDITION = 2.0;

// 양도소득세 세율
export const CAPITAL_GAINS_TAX_BRACKETS = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
];

// 장기보유 특별공제율 (일반, 1세대1주택은 별도)
export const LONG_TERM_HOLDING_DEDUCTION: Record<number, number> = {
  3: 0.06,
  4: 0.08,
  5: 0.10,
  6: 0.12,
  7: 0.14,
  8: 0.16,
  9: 0.18,
  10: 0.20,
  11: 0.22,
  12: 0.24,
  13: 0.26,
  14: 0.28,
  15: 0.30, // 15년 이상 최대 30%
};

// 이자소득세
export const INTEREST_TAX_RATES = {
  normal: 0.154, // 일반과세 15.4% (소득세 14% + 지방소득세 1.4%)
  taxFree: 0, // 비과세
  preferential: 0.095, // 세금우대 9.5%
};

// 부가세
export const VAT_RATE = 0.1; // 10%
