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
  const r = computeCancelResult(base);
  assert.strictEqual(r.rate.ratePercent, 3.1);
  assert.strictEqual(r.interest.interest, 77_500);
  assert.strictEqual(r.interest.interestTax, 11_935);
  assert.strictEqual(r.interest.afterTaxInterest, 65_565);
  assert.strictEqual(r.deductionBasis, 2_400_000);
  assert.strictEqual(r.reclaimedDeductionTax, 158_400);
  assert.strictEqual(r.capReclaimTax, 158_400);
  assert.strictEqual(r.penaltyTax, 158_400);
  // 순손익 = 세후이자 - 추징세액 (원금은 그대로 돌려받으니 상쇄)
  assert.strictEqual(r.interest.afterTaxInterest - r.penaltyTax, -92_835);
});

test("정답지 B — 한계세율 6%, 캡 발동", () => {
  const r = computeCancelResult({ ...base, marginalTaxRate: 6 });
  assert.strictEqual(r.reclaimedDeductionTax, 63_360);
  assert.strictEqual(r.capReclaimTax, 158_400);
  assert.strictEqual(r.penaltyTax, 63_360);
});

test("정답지 C — 5년 경과, 추징 면제", () => {
  const r = computeCancelResult({ ...base, joinDate: "2019-01-01", cancelDate: "2026-01-01" });
  assert.strictEqual(r.penaltyExempt, true);
  assert.strictEqual(r.penaltyTax, 0);
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
  const r = computeCancelResult({ ...base, productType: "youthDream", cancelDate: "2024-06-01" });
  assert.strictEqual(r.rate.ratePercent, 2.3);
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
