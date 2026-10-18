import assert from "node:assert/strict";
import eurData from "./eurkrw-rate-series.json";
import { parseYear, summarizeYear } from "./exchange-year";

const data = [
  ...Array.from({ length: 12 }, (_, i) => ({
    date: `2022-${String(i + 1).padStart(2, "0")}`,
    rate: 1200 + i,
  })),
  { date: "2023-01", rate: 1300 },
  { date: "2023-02", rate: 1300 },
  { date: "2023-03", rate: 1400 },
  ...Array.from({ length: 9 }, (_, i) => ({
    date: `2023-${String(i + 4).padStart(2, "0")}`,
    rate: 1350,
  })),
];
const summary = summarizeYear(data, 2023)!;
assert.equal(summary.points.length, 12);
assert.equal(summary.averageOfMonthlyAverages, 1345.8333333333333);
assert.equal(summary.highMonth.date, "2023-03");
assert.equal(summary.lowMonth.date, "2023-01");
assert.deepEqual(summary.lowMonths, ["2023-01", "2023-02"]);
assert.equal(summary.complete, true);
assert.equal(summary.previousYearComparable, true);
assert.equal(summary.previousYear?.months, 12);
const partial = summarizeYear(data, 2022)!;
assert.equal(partial.points.length, 12);
assert.equal(parseYear("2023"), 2023);
assert.equal(parseYear("23"), null);
assert.equal(parseYear("2023x"), null);
const real2023 = summarizeYear(eurData.series, 2023)!;
assert.equal(real2023.points.length, 12);
assert.equal(real2023.averageOfMonthlyAverages, 1412.3175);
assert.equal(real2023.highMonth.date, "2023-04");
assert.equal(real2023.lowMonth.date, "2023-01");
const real2026 = summarizeYear(eurData.series, 2026)!;
assert.equal(real2026.points.length, 9);
assert.equal(real2026.complete, false);
assert.equal(real2026.previousYear?.months, 9);
assert.equal(real2026.previousYearComparable, true);
assert.throws(() => summarizeYear([
  { date: "2023-01", rate: 1 },
  { date: "2023-01", rate: 2 },
], 2023), /중복/);
console.log("exchange-year tests passed");
