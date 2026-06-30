/**
 * 아파트 대출 감당 시뮬레이터 — 표준 원리금균등 + 2026 규제(LTV·DSR) 판정.
 *
 * 출처: raw/web/apartment-loan-simulator-logic.md (검산으로 역설계 확정).
 * 점수 계산기와 짝("어디 살까" ↔ "감당되나"), 별도 페이지·상호 다리.
 *
 * ⚠️ DSR 분모는 **세전 연소득** — 세후월소득×12 아님(검산: 세후월 7,965,515 vs
 *    세전연 105,688,000). 세후월소득은 "세후 비중"(체감 부담) 표시용.
 * ⚠️ 규제·금리는 시간민감 → 상수는 LOAN_REGULATION 한 곳 + "2026.6 기준" 라벨.
 *    금리는 사용자 입력 기본(하드코딩 판정 금지).
 *
 * 회귀(신혼부부 OFF): 집값8억·시드3.2억·30년·4.10%·세후월7,965,515·세전연105,688,000
 *      → 취득세 20,533,333(2.567%)·가용시드 299,466,667·대출5.005억
 *      / 월원리금 ₩2,418,569 / 세후비중 30.36% / LTV 62.57% / DSR 27.46% / 최종 가능.
 * 회귀(신혼부부 ON): 취득세 18,533,333·가용시드 301,466,667·대출4.985억
 *      / 월원리금 ₩2,408,905 / DSR 27.35% / 최종 가능.
 */

/** 2026.6 기준 규제 상수 — 시간민감, 갱신 시 여기만 수정 */
export const LOAN_REGULATION = {
  asOf: "2026.6",
  /** 생애최초·규제지역 LTV 한도 */
  ltvFirstTime: 0.7,
  /** DSR 한도 (1금융권) */
  dsrLimit: 0.4,
  /** 스트레스 DSR 3단계 — 변동금리 기본 가산(은행별 정밀 가산은 스코프아웃) */
  stressRateDefault: 0.015,
  /**
   * 수도권 주담대 차등 한도 (시가 구간별 상한).
   * 시가 15억↓ 6억 / 15~25억 4억 / 25억↑ 2억.
   */
  loanCaps: [
    { maxPrice: 1_500_000_000, cap: 600_000_000 },
    { maxPrice: 2_500_000_000, cap: 400_000_000 },
    { maxPrice: Infinity, cap: 200_000_000 },
  ],
  /** 규제지역(참고 표시용) */
  regulatedAreas: ["강남", "서초", "송파", "용산"],
  /** 지방교육세 = 취득세 본세 × 10% */
  eduTaxRate: 0.1,
  /** 신혼부부·생애최초 취득세 감면 (가액 등 조건 충족 가정) */
  newlywedTaxCredit: 2_000_000,
} as const;

export interface LoanInput {
  /** 타겟 집 가격 */
  homePrice: number;
  /** 보유 목돈(시드) */
  seed: number;
  /** 세후 월소득 (세후 비중 표시용) */
  netMonthlyIncome: number;
  /** 세전 연소득 (DSR 판정용) */
  grossAnnualIncome: number;
  /** 연 금리 (%) */
  annualRatePct: number;
  /** 상환기간 (년) */
  years: number;
  /** 변동금리 여부 (true면 스트레스 DSR 재판정) */
  isVariableRate: boolean;
  /** 생애최초 여부 */
  isFirstTime: boolean;
  /** 신혼부부(생애최초) 취득세 감면 적용 여부 */
  isNewlywed: boolean;
}

export interface LoanResult {
  loanAmount: number;
  /** 취득세 (본세+지방교육세 − 신혼부부 감면) — 시드에서 차감 */
  acquisitionCost: number;
  /** 취득세 차감 후 실제 가용 시드 */
  availableSeed: number;
  monthlyPayment: number;
  /** 세후소득 비중 (월원리금/세후월소득) */
  netIncomeShare: number;
  ltvRatio: number;
  ltvCap: number;
  loanCapAmount: number;
  ltvOk: boolean;
  dsr: number;
  /** 변동금리 스트레스 가산 후 DSR (변동 아니면 dsr과 동일) */
  stressedDsr: number;
  dsrOk: boolean;
  /** 최종 판정 = LTV가능 AND DSR가능 */
  affordable: boolean;
}

/** 수도권 차등 주담대 한도 */
export function loanCapForPrice(homePrice: number): number {
  const tier = LOAN_REGULATION.loanCaps.find((t) => homePrice <= t.maxPrice);
  return tier ? tier.cap : LOAN_REGULATION.loanCaps[LOAN_REGULATION.loanCaps.length - 1].cap;
}

/** 원리금균등 월 상환액 (반올림 원 단위) */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  years: number
): number {
  const n = Math.round(years * 12);
  if (n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.round(principal / n);
  const factor = Math.pow(1 + r, n);
  return Math.round((principal * r * factor) / (factor - 1));
}

/** 월 상환액 한도로 빌릴 수 있는 최대 원금 (원리금균등 역산) */
export function maxLoanForPayment(
  payment: number,
  annualRatePct: number,
  years: number
): number {
  const n = Math.round(years * 12);
  if (n <= 0 || payment <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return Math.round(payment * n);
  const factor = Math.pow(1 + r, n);
  return Math.round((payment * (factor - 1)) / (r * factor));
}

/** 주택 취득세 본세율 (1주택·유상취득, 가액 구간 누진) — 6억↓1%/6~9억 누진/9억↑3% */
export function acquisitionTaxRate(homePrice: number): number {
  const eok = homePrice / 100_000_000;
  if (eok <= 6) return 0.01;
  if (eok <= 9) return (eok * (2 / 3) - 3) / 100;
  return 0.03;
}

/** 취득세 총액(본세+지방교육세) − 신혼부부 감면. 가정: 1주택·무주택·85㎡이하(농특세 X). */
export function acquisitionTax(homePrice: number, isNewlywed: boolean): number {
  const base = homePrice * acquisitionTaxRate(homePrice);
  const withEdu = base * (1 + LOAN_REGULATION.eduTaxRate);
  const credit = isNewlywed ? LOAN_REGULATION.newlywedTaxCredit : 0;
  return Math.max(Math.round(withEdu - credit), 0);
}

export function calculateLoan(input: LoanInput): LoanResult {
  const {
    homePrice,
    seed,
    netMonthlyIncome,
    grossAnnualIncome,
    annualRatePct,
    years,
    isVariableRate,
    isFirstTime,
    isNewlywed,
  } = input;

  const acquisitionCost = acquisitionTax(homePrice, isNewlywed);
  const availableSeed = Math.max(seed - acquisitionCost, 0);
  const loanAmount = Math.max(homePrice - availableSeed, 0);
  const payment = monthlyPayment(loanAmount, annualRatePct, years);

  const netIncomeShare =
    netMonthlyIncome > 0 ? payment / netMonthlyIncome : 0;

  // LTV — 한도(생애최초 70%) + 차등 한도(금액) 동시 충족
  const ltvRatio = homePrice > 0 ? loanAmount / homePrice : 0;
  const ltvCap = LOAN_REGULATION.ltvFirstTime; // 본 계산기는 생애최초/무주택 70% 기준
  const loanCapAmount = loanCapForPrice(homePrice);
  const ltvOk = ltvRatio <= ltvCap && loanAmount <= loanCapAmount;

  // DSR — 분모는 세전 연소득
  const dsr =
    grossAnnualIncome > 0 ? (payment * 12) / grossAnnualIncome : Infinity;

  // 변동금리: 스트레스금리 가산해 재판정
  const stressedPayment = isVariableRate
    ? monthlyPayment(
        loanAmount,
        annualRatePct + LOAN_REGULATION.stressRateDefault * 100,
        years
      )
    : payment;
  const stressedDsr =
    grossAnnualIncome > 0
      ? (stressedPayment * 12) / grossAnnualIncome
      : Infinity;

  const dsrForJudgment = isVariableRate ? stressedDsr : dsr;
  const dsrOk = dsrForJudgment <= LOAN_REGULATION.dsrLimit;

  // isFirstTime은 현재 LTV 70% 기준 가정에 대한 안내용(다주택·지역 분기는 스코프아웃)
  void isFirstTime;

  return {
    loanAmount,
    acquisitionCost,
    availableSeed,
    monthlyPayment: payment,
    netIncomeShare,
    ltvRatio,
    ltvCap,
    loanCapAmount,
    ltvOk,
    dsr,
    stressedDsr,
    dsrOk,
    affordable: ltvOk && dsrOk,
  };
}
