import assert from "assert";
import {
  defaultTreasuryComparison,
  chartPoints,
  fixedRateBondDirection,
  nextChartSelection,
  selectTreasuryComparison,
  type UsTreasuryInterpretationData,
} from "./us-treasury-interpretation";

const data: UsTreasuryInterpretationData = {
  treasury10y: [
    { date: "2026-01-02", value: 4.5 },
    { date: "2026-01-05", value: 4.6 },
    { date: "2026-01-06", value: 4.55 },
  ],
  krwPerUsd: [
    { date: "2026-01-02", value: 1400 },
    { date: "2026-01-05", value: 1412.5 },
  ],
  h15PreparedAt: "2026-01-06T16:15:00",
  h10PreparedAt: "2026-01-07T16:15:00",
  sourceCheckedAt: "2026-01-07",
};

const snapped = selectTreasuryComparison(data, "2026-01-04", "2026-01-05");
assert.ok(snapped, "DGS10 선택일은 직전 실제 관측일로 보정한다");
assert.strictEqual(snapped.a.date, "2026-01-02");
assert.strictEqual(snapped.a.requestedDate, "2026-01-04");
assert.strictEqual(snapped.basisPointChange, 10, "금리 차이는 bp로 계산한다");
assert.deepStrictEqual(snapped.fx, {
  a: { date: "2026-01-02", value: 1400 },
  b: { date: "2026-01-05", value: 1412.5 },
  wonChangeForUsd1000: 12500,
});

const missingFx = selectTreasuryComparison(data, "2026-01-02", "2026-01-06");
assert.ok(missingFx, "금리 비교는 환율 결측과 분리한다");
assert.strictEqual(missingFx.fx, null, "환율을 이전 관측값으로 전방 채움하지 않는다");

const defaultSelection = defaultTreasuryComparison(data);
assert.ok(defaultSelection, "같은 날짜 환율이 있는 최근 두 금리 관측일을 기본값으로 쓴다");
assert.strictEqual(defaultSelection.a.date, "2026-01-02");
assert.strictEqual(defaultSelection.b.date, "2026-01-05");

const yearApartData: UsTreasuryInterpretationData = {
  ...data,
  treasury10y: [
    { date: "2025-01-03", value: 4.5 },
    { date: "2026-01-02", value: 4.6 },
    { date: "2026-01-05", value: 4.55 },
  ],
  krwPerUsd: [
    { date: "2025-01-03", value: 1400 },
    { date: "2026-01-02", value: 1410 },
    { date: "2026-01-05", value: 1412.5 },
  ],
};
const yearApartDefault = defaultTreasuryComparison(yearApartData);
assert.ok(yearApartDefault, "1년 전 공통 관측일이 있으면 기본 비교에 쓴다");
assert.strictEqual(yearApartDefault.a.date, "2025-01-03");
assert.strictEqual(yearApartDefault.b.date, "2026-01-05");

const firstChartTap = nextChartSelection(data, null, "2026-01-02");
assert.strictEqual(firstChartTap.pendingA, "2026-01-02", "첫 그래프 선택은 A를 기다린다");
assert.strictEqual(firstChartTap.comparison, null);

const secondChartTap = nextChartSelection(data, firstChartTap.pendingA, "2026-01-05");
assert.strictEqual(secondChartTap.pendingA, null, "둘째 그래프 선택 뒤에는 다음 A 선택을 기다린다");
assert.ok(secondChartTap.comparison, "두 점을 선택하면 비교가 확정된다");
assert.strictEqual(secondChartTap.comparison.basisPointChange, 10);

const longHistory = Array.from({ length: 800 }, (_, index) => ({
  date: new Date(Date.UTC(2020, 0, index + 1)).toISOString().slice(0, 10),
  value: index,
}));
const reduced = chartPoints(longHistory, "ALL", 100);
assert.ok(reduced.length <= 104, "전체 그래프는 표시점만 축약한다");
assert.strictEqual(reduced.at(-1)?.date, longHistory.at(-1)?.date, "축약해도 마지막 실제 관측일은 보존한다");
assert.ok(reduced.some((point) => point.value === 0), "축약해도 최저 관측값은 보존한다");
assert.ok(reduced.some((point) => point.value === 799), "축약해도 최고 관측값은 보존한다");

assert.deepStrictEqual(fixedRateBondDirection(1), { yield: "↑", price: "↓" });
assert.deepStrictEqual(fixedRateBondDirection(-1), { yield: "↓", price: "↑" });
assert.deepStrictEqual(fixedRateBondDirection(0), { yield: "변화 없음", price: "변화 없음" });

console.log("✓ US Treasury A/B date alignment and conversion");
