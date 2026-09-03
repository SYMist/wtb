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
 * 🔴 개정일 소급 급소(2026-09-04 확증, 국토교통부고시 제2024-505호 부칙 원문):
 * 가입기간 구간(1년미만/1~2년/2년이상)은 해지 시점 총 가입기간으로 한 번 정해져
 * 전 기간에 적용된다(Q1 · 손대지 않는다). 하지만 그 구간의 "이율값"은 고시가
 * 개정될 때마다 달력 시점으로 갈린다 — 개정 전 회차는 개정 전 이율, 개정 후
 * 회차·잔여기간은 개정 후 이율이다. RATE_HISTORY 가 그 개정 이력이고, 이자는
 * 회차별로 이 표를 가로질러 구간 분할 합산한다(계산 단위는 아래와 동일하게 월).
 *
 * 이자는 실제 예치일수가 아니라 회차별 경과월수(월/12) 기준 단리로 계산한다
 * (은행 정기적립식 관행 — 예치일수 방식과 결과가 다르며, 검증된 정답지는
 * 월수 기준과만 일치한다). 부분월은 절사한다. 고시 원문 자체엔 일할/월할 계산
 * 방식이 명시돼 있지 않다(2026-09-04 원문 확인) — 월 단위는 기존 구현 유지.
 */

interface RateHistoryRow {
  from: string; // 시행일(YYYY-MM-DD), 이 날짜부터 적용
  under1: number; // 1개월 초과 ~ 1년 미만
  oneToTwo: number; // 1년 이상 ~ 2년 미만
  over2: number; // 2년 이상 (일반)
  youthOver2: number; // 청년주택드림 2년 이상 ~ 10년 이내 우대이율
}

/**
 * 국토교통부고시 「주택청약종합저축의 이자율 및 운영에 관한 고시」 개정 이력.
 * 2026-09-04 원문 확인(제2024-505호 부칙 별표, law.go.kr 본문 교차 확인) —
 * 1982.07.23 이후 전 구간, 청년주택드림 2018.07.31 출시 이후 전 구간 포함.
 * 2018-07-31 이전 청년드림 미출시 구간의 youthOver2 는 일반값을 채워둔 자리값
 * (해당 구간에 청년드림 가입일이 존재할 수 없어 실사용되지 않는다).
 */
const RATE_HISTORY: RateHistoryRow[] = [
  { from: "1982-07-23", under1: 1.8, oneToTwo: 3, over2: 6, youthOver2: 6 },
  { from: "1986-01-01", under1: 2.5, oneToTwo: 5, over2: 8, youthOver2: 8 },
  { from: "1992-07-13", under1: 2.5, oneToTwo: 5, over2: 10, youthOver2: 10 },
  { from: "2002-10-29", under1: 2.5, oneToTwo: 5, over2: 6, youthOver2: 6 },
  { from: "2006-02-24", under1: 2.5, oneToTwo: 3.5, over2: 4.5, youthOver2: 4.5 },
  { from: "2012-12-21", under1: 2.0, oneToTwo: 3.0, over2: 4.0, youthOver2: 4.0 },
  { from: "2013-07-22", under1: 2.0, oneToTwo: 2.5, over2: 3.3, youthOver2: 3.3 },
  { from: "2014-10-01", under1: 2.0, oneToTwo: 2.5, over2: 3.0, youthOver2: 3.0 },
  { from: "2015-03-01", under1: 1.8, oneToTwo: 2.3, over2: 2.8, youthOver2: 2.8 },
  { from: "2015-06-22", under1: 1.5, oneToTwo: 2.0, over2: 2.5, youthOver2: 2.5 },
  { from: "2015-10-12", under1: 1.2, oneToTwo: 1.7, over2: 2.2, youthOver2: 2.2 },
  { from: "2016-01-04", under1: 1.0, oneToTwo: 1.5, over2: 2.0, youthOver2: 2.0 },
  { from: "2016-08-12", under1: 1.0, oneToTwo: 1.5, over2: 1.8, youthOver2: 1.8 },
  { from: "2018-07-31", under1: 1.0, oneToTwo: 1.5, over2: 1.8, youthOver2: 3.3 },
  { from: "2022-11-23", under1: 1.3, oneToTwo: 1.8, over2: 2.1, youthOver2: 3.6 },
  { from: "2023-08-30", under1: 2.0, oneToTwo: 2.5, over2: 2.8, youthOver2: 4.3 },
  { from: "2024-02-21", under1: 2.0, oneToTwo: 2.5, over2: 2.8, youthOver2: 4.5 },
  { from: "2024-09-23", under1: 2.3, oneToTwo: 2.8, over2: 3.1, youthOver2: 4.5 },
];

export const CURRENT_NOTICE = {
  number: "국토교통부고시 제2024-505호",
  effectiveFrom: RATE_HISTORY[RATE_HISTORY.length - 1].from,
} as const;

function historyRowAt(date: Date): RateHistoryRow {
  let row = RATE_HISTORY[0];
  for (const candidate of RATE_HISTORY) {
    if (parseDate(candidate.from) <= date) row = candidate;
    else break;
  }
  return row;
}

function rateColumnFor(bucket: RateInfo["bucket"], row: RateHistoryRow): number {
  switch (bucket) {
    case "1년미만":
      return row.under1;
    case "2년미만":
      return row.oneToTwo;
    case "2년이상":
      return row.over2;
    case "2~10년":
      return row.youthOver2;
    case "10년초과":
      // 기존 구현이 general 2년이상값을 그대로 재사용하던 근사치 — 손대지 않는다.
      return row.over2;
    default:
      return 0;
  }
}

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
  let bucket: RateInfo["bucket"];
  if (cancel < addYears(join, 1)) bucket = "1년미만";
  else if (cancel < addYears(join, 2)) bucket = "2년미만";
  else if (productType === "general") bucket = "2년이상";
  else if (cancel <= addYears(join, 10)) bucket = "2~10년";
  else bucket = "10년초과";
  // 해지 시점 기준 현재 이율 — 화면 표시용. 실제 이자는 개정 이력을 가로질러
  // computeInterest 가 회차·구간별로 따로 계산한다(아래).
  const ratePercent = rateColumnFor(bucket, historyRowAt(cancel));
  return { months, ratePercent, bucket };
}

function computeInterest(
  join: Date,
  cancel: Date,
  monthlyAmount: number,
  bucket: RateInfo["bucket"],
  taxFreeEligible: boolean,
): InterestResult {
  const rawMonths = monthsElapsed(join, cancel);
  const installments =
    rawMonths > 0 ? rawMonths : cancel > join ? 1 : 0;
  const principal = installments * monthlyAmount;

  let interest = 0;
  if (bucket !== "무이자") {
    for (let t = 0; t < installments; t++) {
      const rate = rateColumnFor(bucket, historyRowAt(addMonths(join, t)));
      const outstandingMonths = t + 1;
      interest += monthlyAmount * (rate / 100) * (outstandingMonths / 12);
    }
    interest = Math.round(interest);
  }
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
  const interest = computeInterest(join, cancel, input.monthlyAmount, rate.bucket, taxFreeEligible);
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
