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

// 소득세 구간 (월 과세표준 기준 — 연간 구간 ÷ 12)
// 공식: tax = 월과세표준 × rate - deduction
// 연간 구간: 14M/50M/88M/150M/300M/500M/1B 원
export const INCOME_TAX_BRACKETS = [
  { min: 0,           max: 1_166_667,  rate: 0.06, deduction: 0 },
  { min: 1_166_667,   max: 4_166_667,  rate: 0.15, deduction: 105_000 },
  { min: 4_166_667,   max: 7_333_333,  rate: 0.24, deduction: 480_000 },
  { min: 7_333_333,   max: 12_500_000, rate: 0.35, deduction: 1_286_667 },
  { min: 12_500_000,  max: 25_000_000, rate: 0.38, deduction: 1_661_667 },
  { min: 25_000_000,  max: 41_666_667, rate: 0.40, deduction: 2_161_667 },
  { min: 41_666_667,  max: 83_333_333, rate: 0.42, deduction: 2_994_333 },
  { min: 83_333_333,  max: Infinity,   rate: 0.45, deduction: 5_494_333 },
];

// 근로소득공제 구간 (총급여 기준 연간)
// 공식: 각 구간별 base + (총급여 - 구간 하한) × rate (단, 최대 2,000만원)
export const EMPLOYMENT_INCOME_DEDUCTION_BRACKETS = [
  { min: 0,           max: 5_000_000,   rate: 0.70, base: 0 },
  { min: 5_000_000,   max: 15_000_000,  rate: 0.40, base: 3_500_000 },
  { min: 15_000_000,  max: 45_000_000,  rate: 0.15, base: 7_500_000 },
  { min: 45_000_000,  max: 100_000_000, rate: 0.05, base: 9_000_000 },
  { min: 100_000_000, max: Infinity,    rate: 0.02, base: 12_000_000 },
];
export const EMPLOYMENT_INCOME_DEDUCTION_MAX = 20_000_000; // 2,000만원 한도

// 근로소득세액공제
// 산출세액 130만원 이하: × 55% / 초과: 71.5만원 + 초과분 × 30%
export const EMPLOYMENT_TAX_CREDIT_THRESHOLD = 1_300_000;
export const EMPLOYMENT_TAX_CREDIT_LOW_RATE = 0.55;
export const EMPLOYMENT_TAX_CREDIT_HIGH_BASE = 715_000;
export const EMPLOYMENT_TAX_CREDIT_HIGH_RATE = 0.30;
// 한도: 총급여 3,300만원 이하 74만원, 초과분 × 0.8% 차감, 최소 66만원
export const EMPLOYMENT_TAX_CREDIT_LIMIT_BASE = 740_000;
export const EMPLOYMENT_TAX_CREDIT_LIMIT_THRESHOLD = 33_000_000;
export const EMPLOYMENT_TAX_CREDIT_LIMIT_RATE = 0.008;
export const EMPLOYMENT_TAX_CREDIT_LIMIT_MIN = 660_000;

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
