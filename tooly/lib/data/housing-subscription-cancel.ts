/**
 * 청약통장 중도해지 손익 계산 — 이자·소득공제 추징 손익.
 *
 * 🔴 이율 급소(2026-09-03 확증): 청년주택드림청약통장의 3.7%/4.2% 우대이율은
 * "청약 당첨으로 인한 해지"에만 적용된다(2년 가입 요건을 당첨 시에만 면제).
 * 이 계산기가 다루는 일반 중도해지는 2년 미만 구간에서 일반 통장과 동일한
 * 2.3%/2.8%가 적용되고, 4.5%는 2년 이상부터만 붙는다. 당첨 해지는 범위 밖.
 *
 * 🔴 추징 급소: 분모는 "연 300만 한도로 캡된 누계"다. 총납입액에 곱하면
 * 월 50만원 납입자 등에서 과대계상된다.
 * 🔴 6.6%는 상한이다. 공제율 40%라 분기점이 한계세율 15% — 그 이하는
 * 실감면세액이 6.6%식 상한보다 작아 실감면세액이 그대로 적용된다.
 *
 * 이자는 실제 예치일수가 아니라 회차별 경과월수(월/12) 기준 단리로 계산한다
 * (은행 정기적립식 관행 — 예치일수 방식과 결과가 다르며, 검증된 정답지는
 * 월수 기준과만 일치한다). 부분월은 절사한다.
 */

export const RATE_EFFECTIVE_DATE = "2026-03-18";

export type ProductType = "general" | "youthDream";

export interface CancelInput {
  joinDate: string; // YYYY-MM-DD
  cancelDate: string; // YYYY-MM-DD
  monthlyAmount: number; // 원, 월 납입액
  productType: ProductType;
  marginalTaxRate: number; // 퍼센트, 예: 15
  youthTaxFree: boolean; // 청년우대형 이자소득 비과세 요건 충족 여부
}

export interface RateInfo {
  months: number;
  ratePercent: number;
  bucket: "무이자" | "1년미만" | "2년미만" | "2년이상" | "2~10년" | "10년초과";
}

export interface InterestResult {
  installments: number;
  principal: number;
  interest: number;
  interestTax: number;
  afterTaxInterest: number;
}

export interface CancelResult {
  rate: RateInfo;
  interest: InterestResult;
  deductionBasis: number;
  reclaimedDeductionTax: number;
  capReclaimTax: number;
  penaltyTax: number;
  penaltyExempt: boolean;
  netAmount: number;
  totalTaxAndPenalty: number;
  periodYears: number;
  periodMonths: number;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addMonths(d: Date, n: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, d.getUTCDate()));
}

function addYears(d: Date, n: number): Date {
  return addMonths(d, n * 12);
}

function monthsElapsed(start: Date, end: Date): number {
  let months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  if (end.getUTCDate() < start.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

function rateFor(join: Date, cancel: Date, productType: ProductType): RateInfo {
  const months = monthsElapsed(join, cancel);
  if (cancel < addMonths(join, 1)) return { months, ratePercent: 0, bucket: "무이자" };
  if (cancel < addYears(join, 1)) return { months, ratePercent: 2.3, bucket: "1년미만" };
  if (cancel < addYears(join, 2)) return { months, ratePercent: 2.8, bucket: "2년미만" };
  if (productType === "general") return { months, ratePercent: 3.1, bucket: "2년이상" };
  if (cancel <= addYears(join, 10)) return { months, ratePercent: 4.5, bucket: "2~10년" };
  return { months, ratePercent: 3.1, bucket: "10년초과" };
}

function computeInterest(
  join: Date,
  cancel: Date,
  monthlyAmount: number,
  ratePercent: number,
  taxFreeEligible: boolean,
): InterestResult {
  const rawMonths = monthsElapsed(join, cancel);
  const installments =
    rawMonths > 0 ? rawMonths : cancel > join ? 1 : 0;
  const sumMonths = (installments * (installments + 1)) / 2;
  const principal = installments * monthlyAmount;
  const interest = Math.round(monthlyAmount * (ratePercent / 100) * (sumMonths / 12));
  const interestTax = taxFreeEligible && interest <= 5_000_000 ? 0 : Math.round(interest * 0.154);
  return { installments, principal, interest, interestTax, afterTaxInterest: interest - interestTax };
}

function deductionBasis(join: Date, installments: number, monthlyAmount: number): number {
  const perYear = new Map<number, number>();
  for (let i = 0; i < installments; i++) {
    const year = addMonths(join, i).getUTCFullYear();
    perYear.set(year, (perYear.get(year) ?? 0) + monthlyAmount);
  }
  let basis = 0;
  for (const amount of perYear.values()) basis += Math.min(amount, 3_000_000);
  return basis;
}

export function computeCancelResult(input: CancelInput): CancelResult {
  const join = parseDate(input.joinDate);
  const cancel = parseDate(input.cancelDate);

  if (cancel <= join) {
    const empty: InterestResult = { installments: 0, principal: 0, interest: 0, interestTax: 0, afterTaxInterest: 0 };
    return {
      rate: { months: 0, ratePercent: 0, bucket: "무이자" },
      interest: empty,
      deductionBasis: 0,
      reclaimedDeductionTax: 0,
      capReclaimTax: 0,
      penaltyTax: 0,
      penaltyExempt: true,
      netAmount: 0,
      totalTaxAndPenalty: 0,
      periodYears: 0,
      periodMonths: 0,
    };
  }

  const rate = rateFor(join, cancel, input.productType);
  const taxFreeEligible = input.productType === "youthDream" && input.youthTaxFree;
  const interest = computeInterest(join, cancel, input.monthlyAmount, rate.ratePercent, taxFreeEligible);
  const basis = deductionBasis(join, interest.installments, input.monthlyAmount);
  const marginal = input.marginalTaxRate / 100;

  const reclaimedDeductionTax = Math.round(basis * 0.4 * marginal * 1.1);
  const capReclaimTax = Math.round(basis * 0.066);
  const penaltyExempt = cancel >= addYears(join, 5);
  const penaltyTax = penaltyExempt ? 0 : Math.min(capReclaimTax, reclaimedDeductionTax);

  const totalMonths = monthsElapsed(join, cancel);

  return {
    rate,
    interest,
    deductionBasis: basis,
    reclaimedDeductionTax,
    capReclaimTax,
    penaltyTax,
    penaltyExempt,
    netAmount: interest.principal + interest.afterTaxInterest,
    totalTaxAndPenalty: interest.interestTax + penaltyTax,
    periodYears: Math.floor(totalMonths / 12),
    periodMonths: totalMonths % 12,
  };
}

export const MARGINAL_TAX_RATES = [6, 15, 24, 35, 38, 40, 42, 45] as const;
