import assert from "assert";
import baseRateData from "./base-rate-series.json";
import {
  firstParam,
  resolveBaseRateMonth,
  type BaseRateMonthLookup,
} from "./base-rate-month";

type Point = { date: string; rate: number };
const series = (baseRateData as { series: Point[] }).series;

function lookup(month: string | undefined): BaseRateMonthLookup {
  return resolveBaseRateMonth(series, month);
}

assert.deepStrictEqual(lookup(undefined), { kind: "empty" });
assert.deepStrictEqual(lookup("2020-05"), {
  kind: "found",
  point: { date: "2020-05", rate: 0.5 },
});
assert.deepStrictEqual(lookup("2020-13"), { kind: "invalid", requested: "2020-13" });
assert.deepStrictEqual(lookup("1999-12"), { kind: "before-range", requested: "1999-12" });
assert.deepStrictEqual(lookup("2099-01"), { kind: "after-range", requested: "2099-01" });
assert.deepStrictEqual(
  resolveBaseRateMonth(
    [
      { date: "2020-01", rate: 1.25 },
      { date: "2020-03", rate: 0.75 },
    ],
    "2020-02",
  ),
  { kind: "missing", requested: "2020-02" },
);
assert.strictEqual(firstParam(["2020-05", "2020-06"]), "2020-05");

console.log("✓ base rate exact-month lookup");
