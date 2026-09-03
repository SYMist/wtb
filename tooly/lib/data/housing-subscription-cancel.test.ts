/**
 * 청약 해지 손익 계산 검산 (의존성 없음)
 * 실행: npx tsx lib/data/housing-subscription-cancel.test.ts
 *
 * 스펙의 검산 정답지 A/B/C + 경계 테스트를 그대로 박아둔다.
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
  youthTaxFree: false,
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

test("경계 — 청년주택드림 10년 정각은 4.5%, 넘으면 3.1%", () => {
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

test("경계 — 2006-02-24 개정 이전 가입 (고표 상단 구간)", () => {
  const r = computeCancelResult({ ...base, joinDate: "2005-01-01", cancelDate: "2007-01-01" });
  assert.strictEqual(r.rate.bucket, "2년이상");
  assert.strictEqual(r.interest.interest, 125_625);
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
