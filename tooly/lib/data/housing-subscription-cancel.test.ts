/**
 * 청약 해지 손익 계산 검산 (의존성 없음)
 * 실행: npx tsx lib/data/housing-subscription-cancel.test.ts
 *
 * 9/04 이율 개정 반영 정답지 A/B/C, 9/08 한도·기간 분할 독립 정답지와 회귀.
 */

import assert from "assert";
import { computeCancelResult, type CancelInput } from "./housing-subscription-cancel";

const tests: Array<[string, () => void]> = [];
function test(name: string, fn: () => void) {
  tests.push([name, fn]);
}

const base: CancelInput = {
  joinDate: "2024-01-01",
  cancelDate: "2026-01-01",
  monthlyAmount: 100_000,
  productType: "general",
  marginalTaxRate: 15,
};

test("정답지 A — 일반, 2년, 한계세율 15%", () => {
  // 2026-09-04 개정일 소급 수정으로 재계산: 가입 2024-01-01 ~ 해지 2026-01-01은
  // 2024-09-23 고시 개정을 가로지른다(2년미만 구간 22개월은 2.8%, 나머지 2개월만 3.1%
  // 아님 — 실제로는 회차별 월수 가중이라 단순 비율이 아니다). 이자는 76,375원으로
  // 기존 77,500원(단일 3.1% 소급)보다 줄어든다 — 이게 이번 수정의 핵심 효과다.
  const r = computeCancelResult(base);
  assert.strictEqual(r.rate.ratePercent, 3.1);
  assert.strictEqual(r.interest.interest, 76_375);
  assert.strictEqual(r.interest.interestTax, 11_762);
  assert.strictEqual(r.interest.afterTaxInterest, 64_613);
  assert.strictEqual(r.deductionBasis, 2_400_000);
  assert.strictEqual(r.reclaimedDeductionTax, 158_400);
  assert.strictEqual(r.capReclaimTax, 158_400);
  assert.strictEqual(r.penaltyTax, 158_400);
  // 순손익 = 세후이자 - 추징세액 (원금은 그대로 돌려받으니 상쇄)
  assert.strictEqual(r.interest.afterTaxInterest - r.penaltyTax, -93_787);
});

test("정답지 B — 한계세율 6%, 캡 발동", () => {
  const r = computeCancelResult({ ...base, marginalTaxRate: 6 });
  assert.strictEqual(r.reclaimedDeductionTax, 63_360);
  assert.strictEqual(r.capReclaimTax, 158_400);
  assert.strictEqual(r.penaltyTax, 63_360);
});

test("정답지 C/D — 5년 경과 추징 면제 + 4개 고시 구간 교차 이자", () => {
  // 2019-01-01 가입 · 매월 10만원 × 84회 · 2026-01-01 해지.
  // 개정일 소급 수정 전(단일 3.1%)은 이자 922,250원이었다. 이 구간은 2018-07-31(1.8%),
  // 2022-11-23(2.1%), 2023-08-30(2.8%), 2024-09-23(3.1%) 4개 고시를 가로지르므로
  // 회차별 정확한 월단위 합산값 740,575원이 정답이다.
  const r = computeCancelResult({ ...base, joinDate: "2019-01-01", cancelDate: "2026-01-01" });
  assert.strictEqual(r.penaltyExempt, true);
  assert.strictEqual(r.penaltyTax, 0);
  assert.strictEqual(r.interest.interest, 740_575);
  assert.strictEqual(r.interest.interestTax, 114_049);
  assert.strictEqual(r.interest.afterTaxInterest, 626_526);
});

test("경계 — 1년 11개월 vs 정확히 2년 (일반)", () => {
  const before = computeCancelResult({ ...base, cancelDate: "2025-12-01" });
  const at = computeCancelResult({ ...base, cancelDate: "2026-01-01" });
  assert.strictEqual(before.rate.ratePercent, 2.8);
  assert.strictEqual(at.rate.ratePercent, 3.1);
});

test("경계 — 1개월 이내 무이자", () => {
  const r = computeCancelResult({ ...base, cancelDate: "2024-01-20" });
  assert.strictEqual(r.rate.ratePercent, 0);
  assert.strictEqual(r.interest.interest, 0);
});

test("경계 — 연납입 600만원은 300만원으로 캡", () => {
  const r = computeCancelResult({ ...base, monthlyAmount: 500_000, cancelDate: "2025-01-01" });
  // 2024년 1~12월, 월 50만 × 12 = 600만 → 300만 캡
  assert.strictEqual(r.deductionBasis, 3_000_000);
});

test("경계 — 청년주택드림 2년 미만은 일반과 동일 이율", () => {
  // 해지일 2024-06-01은 2024-09-23 개정 전이라 그 시점 시행 이율(2.0%)이 맞다.
  // 2.3%는 개정 후 이율을 소급 적용한 옛 결함값이었다.
  const r = computeCancelResult({ ...base, productType: "youthDream", cancelDate: "2024-06-01" });
  assert.strictEqual(r.rate.ratePercent, 2.0);
});

test("표시이율 경계 — 청년주택드림 10년 정각은 4.5%, 넘으면 3.1%", () => {
  const at10 = computeCancelResult({
    ...base,
    productType: "youthDream",
    joinDate: "2016-01-01",
    cancelDate: "2026-01-01",
  });
  const over10 = computeCancelResult({
    ...base,
    productType: "youthDream",
    joinDate: "2016-01-01",
    cancelDate: "2026-01-02",
  });
  assert.strictEqual(at10.rate.ratePercent, 4.5);
  assert.strictEqual(over10.rate.ratePercent, 3.1);
});

test("경계 — 가입일이 개정 시행일과 정확히 같음 (단일 구간)", () => {
  const r = computeCancelResult({ ...base, joinDate: "2024-09-23", cancelDate: "2026-01-01" });
  assert.strictEqual(r.interest.installments, 15);
  assert.strictEqual(r.interest.interest, 28_000);
});

test("경계 — 가입일이 개정 시행일 하루 전 (첫 회차만 구개정)", () => {
  // 위 케이스와 회차 수는 같지만 1회차만 2024-02-21 고시(2.5%)를, 나머지는
  // 2024-09-23 고시(2.8%)를 쓴다 — 이자가 25원 줄어든다.
  const r = computeCancelResult({ ...base, joinDate: "2024-09-22", cancelDate: "2026-01-01" });
  assert.strictEqual(r.interest.installments, 15);
  assert.strictEqual(r.interest.interest, 27_975);
});

test("경계 — 고시 개정일이 회차 중간에 낌 (일 단위 아닌 월슬롯 단위 귀속)", () => {
  // 2015-06-22 개정은 이 가입월(매월 15일 슬롯)의 중간에 낀다. 이 계산기는
  // 예치일수가 아니라 회차별 슬롯 시작일 기준으로 귀속하므로(코드 상단 주석 참고),
  // 슬롯 전체가 그 슬롯 시작 시점의 고시를 따른다 — 결함이 아니라 설계된 근사다.
  const r = computeCancelResult({ ...base, joinDate: "2015-01-15", cancelDate: "2015-12-15" });
  assert.strictEqual(r.interest.installments, 11);
  assert.strictEqual(r.interest.interest, 8_300);
});

test("청년주택드림은 체크박스 없이 이자소득세 비과세가 자동 적용된다", () => {
  const y = computeCancelResult({ ...base, productType: "youthDream" });
  const g = computeCancelResult(base);
  assert.strictEqual(y.interest.interestTax, 0);
  assert.strictEqual(y.interest.afterTaxInterest, y.interest.interest);
  assert.notStrictEqual(g.interest.interestTax, 0);
});

test("경계 — 2006-02-24 개정 이전 가입 (고표 상단 구간)", () => {
  const r = computeCancelResult({ ...base, joinDate: "2005-01-01", cancelDate: "2007-01-01" });
  assert.strictEqual(r.rate.bucket, "2년이상");
  assert.strictEqual(r.interest.interest, 125_625);
});

// 독립 정답지: 2022-01 월초 가입, 50개월. 슬롯 1~11=3.3%, 12~20=3.6%,
// 21~26=4.3%, 27~50=4.5%. 가중합은 66×3.3+144×3.6+141×4.3+924×4.5=5500.5.
// 월초 슬롯 방식의 정답이며 실제 은행 일할액이나 9/03 최초 배포 정답지가 아니다.
const capCase: CancelInput = { ...base, joinDate: "2022-01-01", cancelDate: "2026-03-01", productType: "youthDream" };
test("우대 한도 — 4,900만원(한도 미만)·5,000만원 정각 원금 및 이자", () => {
  for (const [monthlyAmount, expectedInterest] of [[980_000, 4_492_075], [1_000_000, 4_583_750]]) {
    const r = computeCancelResult({ ...capCase, monthlyAmount });
    assert.strictEqual(r.interest.principal, monthlyAmount * 50);
    assert.strictEqual(r.interest.interest, expectedInterest);
  }
});

test("우대 한도 — 마지막 달 100만원 초과분은 기본 3.1%", () => {
  // 수학적 경계 입력(월 상품한도를 검증하는 테스트가 아님).
  // 1,020,000×5500.5/1200 − 1,000,000×(4.5−3.1)/1200 = 4,674,258.333…
  const r = computeCancelResult({ ...capCase, monthlyAmount: 1_020_000 });
  assert.strictEqual(r.interest.principal, 51_000_000);
  assert.strictEqual(r.interest.interest, 4_674_258);
});

test("우대 한도 — 초과 후 우대·기본 이율 개정 모두 달력월별 적용", () => {
  // 수학적 스트레스 입력: 월200만원, 26개월차부터 초과.
  // 무한도 9,167,500 − [2백만×1.5 + 70백만×1.7 + 578백만×1.4]/1200.
  // 2024-02-21 우대 변경은 27월차부터, 09-23 기본 변경은 34월차부터 귀속.
  const r = computeCancelResult({ ...capCase, monthlyAmount: 2_000_000 });
  assert.strictEqual(r.interest.principal, 100_000_000);
  assert.strictEqual(r.interest.interest, 8_391_500);
});

test("한도 회귀 — 일반 상품은 5천만원 초과에도 원금 전액 기본이율", () => {
  // 기본 가중합: (1~11)×1.8 + (12~20)×2.1 + (21~33)×2.8 + (34~50)×3.1 = 3617.4.
  const r = computeCancelResult({ ...capCase, productType: "general", monthlyAmount: 2_000_000 });
  assert.strictEqual(r.interest.principal, 100_000_000);
  assert.strictEqual(r.interest.interest, Math.round(2_000_000 * 3617.4 / 1200));
});

test("한도 회귀 — 청년 2년 미만은 초과 잔액까지 일반과 동일", () => {
  for (const cancelDate of ["2022-12-01", "2023-12-01"]) {
    const input = { ...capCase, cancelDate, monthlyAmount: 5_000_000 };
    assert.strictEqual(computeCancelResult(input).interest.interest,
      computeCancelResult({ ...input, productType: "general" }).interest.interest);
  }
});

test("10년 초과 — 첫 10년 우대 유지, 이후 잔액은 기본이율", () => {
  // 미래 경계의 수학적 테스트: 이후 금리가 바뀌지 않는다는 가정, 예측값 아님.
  // 2019-01 가입은 실제 가능한 청년우대형 가입일. 2028-12까지 120개 월슬롯.
  const input = { ...base, productType: "youthDream" as const, joinDate: "2019-01-01", cancelDate: "2029-01-01", monthlyAmount: 1_000_000 };
  const at = computeCancelResult(input);
  const nextDay = computeCancelResult({ ...input, cancelDate: "2029-01-02" });
  const nextMonth = computeCancelResult({ ...input, cancelDate: "2029-02-01" });
  assert.strictEqual(at.rate.ratePercent, 4.5);
  assert.strictEqual(nextDay.rate.ratePercent, 3.1);
  assert.strictEqual(nextDay.interest.interest, at.interest.interest); // 부분월 절사
  // 원·퍼센트 월합을 독립 구간별로 계산. 마지막에 한 번만 반올림한다.
  // 1~47,48~50,51~56,57~62,63~69,70~120 슬롯으로 나눔.
  const firstTenYears = 1_000_000 * (1128*3.3 + 147*3.6 + 300*3.6 + 21*2.1
    + 300*4.3 + 57*2.8 + 350*4.5 + 112*2.8 + 2550*4.5 + 2295*3.1) / 1200;
  assert.strictEqual(at.interest.interest, Math.round(firstTenYears));
  assert.strictEqual(nextMonth.interest.interest,
    Math.round(firstTenYears + 121_000_000 * 3.1 / 1200));
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${name}`);
    console.error(e);
  }
}
if (failed > 0) {
  console.error(`\n${failed}/${tests.length} 실패`);
  process.exit(1);
}
console.log(`\n${tests.length}/${tests.length} 통과`);
