/**
 * 예적금 과세 유형·이자 계산 검산
 * 실행: npx tsx lib/calculators/deposit.test.ts
 */

import assert from "assert";
import { calculateDeposit } from "./deposit";

const tests: Array<[string, () => void]> = [];
function test(name: string, fn: () => void) {
  tests.push([name, fn]);
}

const deposit = {
  amount: 100_000_000,
  annualRate: 3.5,
  months: 12,
  productType: "deposit" as const,
  taxType: "normal" as const,
};

test("정답지 — 일반과세 정기예금 1억원·연 3.5%·12개월", () => {
  const r = calculateDeposit(deposit);
  assert.strictEqual(r.preTaxInterest, 3_500_000);
  assert.strictEqual(r.tax, 539_000);
  assert.strictEqual(r.postTaxInterest, 2_961_000);
  assert.strictEqual(r.maturityAmount, 102_961_000);
  assert.strictEqual(r.taxRate, 15.4);
});

test("세율별 대표값 — 1.4%·5.9%·9.5%·0%", () => {
  const expected = {
    cooperativeRuralExempt: [0, 3_500_000, 0],
    cooperativeExempt: [49_000, 3_451_000, 1.4],
    cooperative2026: [206_500, 3_293_500, 5.9],
    preferential: [332_500, 3_167_500, 9.5],
    taxFree: [0, 3_500_000, 0],
  } as const;

  for (const [taxType, [tax, postTaxInterest, taxRate]] of Object.entries(expected)) {
    const r = calculateDeposit({ ...deposit, taxType: taxType as keyof typeof expected });
    assert.strictEqual(r.tax, tax);
    assert.strictEqual(r.postTaxInterest, postTaxInterest);
    assert.strictEqual(r.taxRate, taxRate);
  }
});

test("경계 — 1원 이자는 반올림 후 모든 과세 유형에서 세금 0원", () => {
  for (const taxType of ["normal", "cooperativeRuralExempt", "cooperativeExempt", "cooperative2026", "preferential", "taxFree"] as const) {
    const r = calculateDeposit({
      amount: 1,
      annualRate: 10,
      months: 1,
      productType: "deposit",
      taxType,
    });
    assert.strictEqual(r.preTaxInterest, 0);
    assert.strictEqual(r.tax, 0);
  }
});

test("회귀 — 단리 적금은 월 납입액·기간·세율을 반영한다", () => {
  const r = calculateDeposit({
    amount: 100_000,
    annualRate: 3.6,
    months: 12,
    productType: "savings",
    interestMethod: "simple",
    taxType: "cooperative2026",
  });
  assert.strictEqual(r.totalDeposited, 1_200_000);
  assert.strictEqual(r.preTaxInterest, 23_400);
  assert.strictEqual(r.tax, 1_381);
  assert.strictEqual(r.maturityAmount, 1_222_019);
});

let failures = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error);
  }
}

if (failures > 0) process.exit(1);
console.log(`${tests.length}개 예적금 계산 검산 통과`);
