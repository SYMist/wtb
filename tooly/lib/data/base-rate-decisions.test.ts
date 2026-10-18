import assert from "node:assert/strict";
import {
  assertNoOfficialHistoryLoss,
  parseBaseRateDecisionRows,
  resolveBaseRateDate,
  validateBaseRateDecisions,
} from "./base-rate-decisions";
import realSnapshot from "./base-rate-decisions.json";

const rows = [
  { date: "2007-08-09", rate: 5 },
  { date: "2008-08-07", rate: 5.25 },
  { date: "2008-10-09", rate: 5 },
  { date: "2008-10-27", rate: 4.25 },
  { date: "2020-03-17", rate: 0.75 },
  { date: "2020-05-28", rate: 0.5 },
];
const snapshot = {
  sourceUrl: "https://www.bok.or.kr/portal/singl/baseRate/list.do?menuNo=200677",
  series: rows,
  checkedAt: "2026-10-18",
  firstChangeDate: rows[0].date,
  lastChangeDate: rows[rows.length - 1].date,
};
assert.equal(resolveBaseRateDate(snapshot, "2008-10-08").kind, "found");
assert.deepEqual(resolveBaseRateDate(snapshot, "2008-10-09"), {
  kind: "found",
  requested: "2008-10-09",
  point: rows[2],
  system: "한국은행 기준금리",
});
assert.deepEqual(resolveBaseRateDate(snapshot, "2008-10-08"), {
  kind: "found",
  requested: "2008-10-08",
  point: rows[1],
  system: "한국은행 기준금리",
});
const beforePolicySwitch = resolveBaseRateDate(snapshot, "2008-02-29");
assert.equal(beforePolicySwitch.kind, "found");
if (beforePolicySwitch.kind === "found") assert.equal(beforePolicySwitch.system, "콜금리 목표");
assert.equal(resolveBaseRateDate(snapshot, "2008-10-26").kind, "found");
const afterPolicySwitch = resolveBaseRateDate(snapshot, "2008-04-01");
assert.equal(afterPolicySwitch.kind, "found");
if (afterPolicySwitch.kind === "found") assert.equal(afterPolicySwitch.system, "한국은행 기준금리");
const may27 = resolveBaseRateDate(snapshot, "2020-05-27");
assert.equal(may27.kind, "found");
if (may27.kind === "found") assert.equal(may27.point.rate, 0.75);
const may28 = resolveBaseRateDate(snapshot, "2020-05-28");
assert.equal(may28.kind, "found");
if (may28.kind === "found") assert.equal(may28.point.rate, 0.5);
assert.equal(resolveBaseRateDate(snapshot, "2026-10-19").kind, "after-range");
assert.equal(resolveBaseRateDate(snapshot, "2026-02-30").kind, "invalid");
assert.throws(() => validateBaseRateDecisions([rows[0], rows[0]]), /중복/);
assert.throws(() => validateBaseRateDecisions([rows[1], { date: "2008-08-08", rate: 5.25 }]), /바뀌지 않은/);
const html = `<table><caption>한국은행 기준금리 추이</caption><tbody><tr><td>2020</td><td>05월 28일</td><td>0.50</td></tr><tr><td>2020</td><td>03월 17일</td><td>0.75</td></tr><tr><td>2008</td><td>10월 27일</td><td>4.25</td></tr><tr><td>2008</td><td>10월 09일</td><td>5.00</td></tr><tr><td>2008</td><td>08월 07일</td><td>5.25</td></tr><tr><td>2007</td><td>08월 09일</td><td>5.00</td></tr></tbody></table>`;
assert.deepEqual(parseBaseRateDecisionRows(html), [
  rows[0], rows[1], rows[2], rows[3], rows[4], rows[5],
]);
assertNoOfficialHistoryLoss(realSnapshot, realSnapshot);
assert.equal(realSnapshot.series.length, 62);
assert.equal(realSnapshot.firstChangeDate, "1999-05-06");
assert.equal(realSnapshot.lastChangeDate, "2026-08-27");
const realTargetDate = resolveBaseRateDate(realSnapshot, "2026-10-18");
assert.equal(realTargetDate.kind, "found");
if (realTargetDate.kind === "found") assert.equal(realTargetDate.point.rate, 3);
assert.throws(() => assertNoOfficialHistoryLoss(realSnapshot, {
  ...realSnapshot,
  series: realSnapshot.series.slice(1),
}), /기존 공식 행 누락/);
assert.throws(() => assertNoOfficialHistoryLoss(realSnapshot, {
  ...realSnapshot,
  lastChangeDate: "2026-08-26",
}), /최신 변경일 후퇴/);
console.log("base-rate-decisions tests passed");
