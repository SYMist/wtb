import assert from "node:assert/strict";
import test from "node:test";
import { CURRENCIES, compareRates } from "./exchange-compare";
import {
  calculateQuote,
  changeFeeMode,
  convertSpending,
  emptyQuote,
  formatSpendingWon,
  parseSpendingInput,
  type QuoteInput,
} from "./exchange-spending";

const quote = (rate: string, extras: Partial<QuoteInput> = {}): QuoteInput => ({
  ...emptyQuote(),
  rate,
  ...extras,
});

test("EUR 3,000: 1,550 → 1,600 = 4,650,000 → 4,800,000; B − A = +150,000", () => {
  const a = calculateQuote(3000, quote("1550"), CURRENCIES.eur)!;
  const b = calculateQuote(3000, quote("1600"), CURRENCIES.eur)!;
  assert.equal(a.totalKrw, 4_650_000);
  assert.equal(b.totalKrw, 4_800_000);
  assert.equal(b.totalKrw - a.totalKrw, 150_000);
  assert.equal(a.totalKrw - b.totalKrw, -150_000);
  const history = compareRates(
    { date: "2020-01", rate: 1550 },
    { date: "2021-01", rate: 1600 },
    CURRENCIES.eur,
    { foreignAmount: 3000 },
  );
  assert.equal(history.foreignFixed.thenKrw, a.totalKrw);
  assert.equal(history.foreignFixed.nowKrw, b.totalKrw);
  assert.equal(history.foreignFixed.diffKrw, 150_000);
  assert.equal(history.krwFixed.amount, 1_000_000);
});

test("4,650,000 + 1% + 5,000 = 4,701,500", () => {
  assert.deepEqual(
    calculateQuote(
      3000,
      quote("1550", { percentFee: "1", fixedFee: "5000" }),
      CURRENCIES.eur,
    ),
    {
      baseKrw: 4_650_000,
      feeKrw: 51_500,
      totalKrw: 4_701_500,
    },
  );
});

test("JPY 100,000 × 900/100 = 900,000 (history and quotes)", () => {
  assert.equal(convertSpending(100_000, 900, CURRENCIES.jpy.unit), 900_000);
  assert.equal(
    calculateQuote(100_000, quote("900"), CURRENCIES.jpy)?.totalKrw,
    900_000,
  );
  assert.equal(
    calculateQuote(
      100_000,
      quote("900", { percentFee: "1", fixedFee: "5000" }),
      CURRENCIES.jpy,
    )?.totalKrw,
    914_000,
  );
});

test("USD/CNY/EUR keep their existing single-currency quotation unit", () => {
  for (const currency of [CURRENCIES.usd, CURRENCIES.cny, CURRENCIES.eur]) {
    assert.equal(
      calculateQuote(100, quote("125.5"), currency)?.totalKrw,
      12_550,
    );
  }
});

test("included quote cannot double-add stale fees, including invalid fee strings", () => {
  for (const fees of [
    { percentFee: "1", fixedFee: "5000" },
    { percentFee: "bad", fixedFee: "" },
    { percentFee: "-1", fixedFee: "Infinity" },
  ]) {
    assert.deepEqual(
      calculateQuote(
        3000,
        quote("1550", { feeMode: "included", ...fees }),
        CURRENCIES.eur,
      ),
      {
        baseKrw: 4_650_000,
        feeKrw: 0,
        totalKrw: 4_650_000,
      },
    );
  }
});

test("mode round trip clears fees, preserves the rate and never resurrects hidden fees", () => {
  const original = quote("1550", { percentFee: "1", fixedFee: "5000" });
  const included = changeFeeMode(original, "included");
  assert.deepEqual(included, quote("1550", { feeMode: "included" }));
  assert.equal(
    calculateQuote(3000, included, CURRENCIES.eur)?.totalKrw,
    4_650_000,
  );
  const separate = changeFeeMode(included, "separate");
  assert.deepEqual(separate, quote("1550"));
  assert.equal(
    calculateQuote(3000, separate, CURRENCIES.eur)?.totalKrw,
    4_650_000,
  );
  assert.equal(original.percentFee, "1");
});

test("identical conditions have zero difference", () => {
  const value = quote("1550.25", { percentFee: "0.75", fixedFee: "125.5" });
  assert.equal(
    calculateQuote(3000.5, value, CURRENCIES.eur)!.totalKrw -
      calculateQuote(3000.5, value, CURRENCIES.eur)!.totalKrw,
    0,
  );
});

test("fractional inputs retain intermediate precision before final display rounding", () => {
  const result = calculateQuote(
    1.25,
    quote("2.345", { percentFee: "0.5", fixedFee: "0.125" }),
    CURRENCIES.eur,
  )!;
  assert.ok(Math.abs(result.baseKrw - 2.93125) < 1e-12);
  assert.ok(Math.abs(result.totalKrw - 3.07090625) < 1e-12);
  assert.equal(formatSpendingWon(result.baseKrw), "2.93원");
  assert.equal(formatSpendingWon(result.totalKrw), "3.07원");
  // Rounding the base first would incorrectly show 2.93원 here.
  assert.equal(
    formatSpendingWon(
      calculateQuote(
        1.25,
        quote("2.345", { percentFee: "0.13" }),
        CURRENCIES.eur,
      )!.totalKrw,
    ),
    "2.94원",
  );
});

test("difference is calculated before rounding totals", () => {
  const a = calculateQuote(1, quote("1.004"), CURRENCIES.eur)!;
  const b = calculateQuote(1, quote("1.005"), CURRENCIES.eur)!;
  assert.equal(formatSpendingWon(a.totalKrw), "1원");
  assert.equal(formatSpendingWon(b.totalKrw), "1.01원");
  assert.equal(formatSpendingWon(b.totalKrw - a.totalKrw, true), "0원");
  assert.equal(formatSpendingWon(-0.001, true), "0원");
});

test("positive decimal input; zero is allowed only for fees", () => {
  for (const raw of [
    "",
    " ",
    "0",
    "-1",
    "NaN",
    "Infinity",
    "1e3",
    "0x10",
    "3,000",
    "3천",
    "1.2.3",
    ".",
  ]) {
    assert.equal(parseSpendingInput(raw), null, raw);
  }
  assert.equal(parseSpendingInput("3000.50"), 3000.5);
  assert.equal(parseSpendingInput(" .5 "), 0.5);
  assert.equal(parseSpendingInput("0", true), 0);
  assert.equal(parseSpendingInput("0.125", true), 0.125);
  for (const raw of ["", " ", "-0.1", "bad"])
    assert.equal(parseSpendingInput(raw, true), null);
});

test("invalid amount/rate/fees yield no result instead of a zero-cost quote", () => {
  for (const amount of [0, -1, NaN, Infinity])
    assert.equal(calculateQuote(amount, quote("1550"), CURRENCIES.eur), null);
  for (const rate of ["", "0", "-1", "bad"])
    assert.equal(calculateQuote(3000, quote(rate), CURRENCIES.eur), null);
  for (const field of ["percentFee", "fixedFee"]) {
    for (const invalid of ["", "-1", "bad"])
      assert.equal(
        calculateQuote(
          3000,
          quote("1550", { [field]: invalid }),
          CURRENCIES.eur,
        ),
        null,
      );
  }
});

test("unsafe magnitudes, overflow, underflow and invalid quotation units are rejected", () => {
  assert.equal(parseSpendingInput("9007199254740992"), null);
  assert.equal(convertSpending(1e12, 1e12, 1), null);
  assert.equal(convertSpending(Number.MIN_VALUE, Number.MIN_VALUE, 1), null);
  for (const unit of [0, -1, NaN, Infinity])
    assert.equal(convertSpending(100, 1000, unit), null);
  assert.equal(
    calculateQuote(
      1e12,
      quote("1000", { percentFee: "100000" }),
      CURRENCIES.eur,
    ),
    null,
  );
});

test("new quote state is blank and never populated from historical rates", () => {
  assert.equal(emptyQuote().rate, "");
  assert.equal(calculateQuote(100, emptyQuote(), CURRENCIES.eur), null);
  assert.notEqual(emptyQuote(), emptyQuote());
});
