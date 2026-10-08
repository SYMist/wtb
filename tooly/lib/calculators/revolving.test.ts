import assert from "node:assert/strict";
import { calculateRevolving, summarizeRevolvingByYear } from "./revolving";

const twoMonths = calculateRevolving({
  initialRolloverPrincipal: 1_000_000,
  annualFeeRatePercent: 18,
  paymentRatePercent: 50,
  monthlyNewPurchases: 0,
  months: 2,
});
assert.deepEqual(
  twoMonths.schedule.map(({ fee, principalPaid, totalPayment, endingPrincipal }) => ({
    fee,
    principalPaid,
    totalPayment,
    endingPrincipal,
  })),
  [
    { fee: 15_000, principalPaid: 500_000, totalPayment: 515_000, endingPrincipal: 500_000 },
    { fee: 7_500, principalPaid: 250_000, totalPayment: 257_500, endingPrincipal: 250_000 },
  ],
);
assert.equal(twoMonths.totalFee, 22_500);
assert.equal(twoMonths.totalPrincipalPaid, 750_000);
assert.equal(twoMonths.totalPayment, 772_500);
assert.equal(twoMonths.endingPrincipal, 250_000);

const fullPayment = calculateRevolving({
  initialRolloverPrincipal: 0,
  annualFeeRatePercent: 20,
  paymentRatePercent: 100,
  monthlyNewPurchases: 300_000,
  months: 3,
});
assert.equal(fullPayment.totalFee, 0);
assert.equal(fullPayment.totalPrincipalPaid, 900_000);
assert.equal(fullPayment.totalPayment, 900_000);
assert.equal(fullPayment.endingPrincipal, 0);
assert.equal(fullPayment.payoffMonth, null);

const payoff = calculateRevolving({
  initialRolloverPrincipal: 100_000,
  annualFeeRatePercent: 17,
  paymentRatePercent: 30,
  monthlyNewPurchases: 0,
  months: 60,
});
assert.ok(payoff.payoffMonth !== null);
assert.equal(payoff.endingPrincipal, 0);
assert.ok(payoff.schedule.slice(payoff.payoffMonth).every((row) => row.fee === 0));

const sample = calculateRevolving({
  initialRolloverPrincipal: 2_000_000,
  annualFeeRatePercent: 17,
  paymentRatePercent: 30,
  monthlyNewPurchases: 300_000,
  months: 60,
});
for (const row of sample.schedule) {
  assert.ok(row.openingPrincipal >= 0);
  assert.ok(row.newPurchases >= 0);
  assert.ok(row.fee >= 0);
  assert.ok(row.principalPaid >= 0);
  assert.ok(row.endingPrincipal >= 0);
  assert.equal(row.totalPayment, row.principalPaid + row.fee);
  assert.equal(row.endingPrincipal, row.principalBeforePayment - row.principalPaid);
}
assert.equal(
  sample.endingPrincipal,
  sample.input.initialRolloverPrincipal + sample.totalNewPurchases - sample.totalPrincipalPaid,
);
assert.equal(sample.totalPayment, sample.totalPrincipalPaid + sample.totalFee);
assert.equal(summarizeRevolvingByYear(sample).length, 5);

const zero = calculateRevolving({
  initialRolloverPrincipal: 0,
  annualFeeRatePercent: 0,
  paymentRatePercent: 30,
  monthlyNewPurchases: 0,
  months: 60,
});
assert.equal(zero.totalPayment, 0);
assert.equal(zero.endingPrincipal, 0);
assert.ok(zero.schedule.every((row) => Object.values(row).every(Number.isFinite)));
assert.ok(zero.schedule.every((row) => row.endingPrincipal === 0));

console.log("Revolving calculator tests passed");
