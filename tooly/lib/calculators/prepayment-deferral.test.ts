import { affordableMonthlyAmount, buildSchedule, defaultPlanInput, dueDates, evaluatePlan, validateInput } from "./prepayment-deferral";

const cases: [string, () => void][] = [];
function test(name: string, fn: () => void) { cases.push([name, fn]); }
function equal(actual: unknown, expected: unknown, label: string) {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
}

test("independent date offsets and exact 6-1-5 / 1-11 integer-day schedules", () => {
  const start = "2026-10-23";
  const due = dueDates(start);
  const offsets = due.map((date) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000));
  equal(JSON.stringify(offsets), JSON.stringify([0, 31, 61, 92, 123, 151, 182, 212, 243, 273, 304, 335]), "약정일 오프셋");
  const sixOneFive = buildSchedule(start, "615", 500_000);
  equal(sixOneFive[6].actualDate, "2027-04-23", "6-1-5 중간 회차");
  equal(sixOneFive[7].actualDate, "2027-10-23", "6-1-5 마지막 묶음");
  equal(sixOneFive.reduce((sum, row) => sum + row.days, 0), 0, "6-1-5 순이연 합계");
  const oneEleven = buildSchedule(start, "111", 500_000);
  equal(oneEleven[1].actualDate, "2027-04-23", "1-11 마지막 묶음");
  equal(oneEleven.reduce((sum, row) => sum - row.days, 0), -5, "1-11 순이연 합계");
});

test("month-end clamping and leap-day calendar", () => {
  equal(JSON.stringify(dueDates("2026-01-31").slice(0, 4)), JSON.stringify(["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"]), "월말 약정일");
  equal(JSON.stringify(dueDates("2024-02-29").slice(0, 3)), JSON.stringify(["2024-02-29", "2024-03-29", "2024-04-29"]), "윤년 가입일");
});

test("preset chooses latest non-positive 1-11 date across varying month lengths", () => {
  const input = { ...defaultPlanInput(), startDate: "2026-01-01", actualDates: [] };
  const schedule = buildSchedule(input.startDate, "111", input.monthlyAmount);
  equal(schedule[1].actualDate, "2026-07-01", "순이연 0 이하 마지막 날짜");
  equal(evaluatePlan(input, "111").netDeferredDays <= 0, true, "기본 1-11 비양수 순이연");
  const laterDates = schedule.map((item) => item.actualDate);
  for (let i = 1; i < laterDates.length; i++) laterDates[i] = "2026-07-02";
  const delayed = evaluatePlan({ ...input, actualDates: laterDates }, "111");
  equal(delayed.netDeferredDays, 4, "이후 하루는 순이연 4일");
  equal(delayed.estimatedMaturityDate, "2027-01-02", "조건부 만기 하루 추정");
  equal(delayed.interestIsConditional, true, "양수 순이연 조건부 이자 표시");
});

test("12-month simple-interest and idle-interest results match independent day-by-day calculation", () => {
  const input = defaultPlanInput();
  const regular = evaluatePlan(input, "regular");
  const sixOneFive = evaluatePlan(input, "615");
  const oneEleven = evaluatePlan(input, "111");
  equal(regular.preTaxInterest, 113_768, "정기 세전 이자");
  equal(regular.netInterest, 96_248, "정기 세후 이자");
  equal(sixOneFive.preTaxInterest, 113_768, "6-1-5 세전 이자 — 선납 추가이자 없음");
  equal(sixOneFive.netInterest, 96_248, "6-1-5 세후 이자 — 선납 추가이자 없음");
  equal(oneEleven.preTaxInterest, 113_768, "1-11 세전 이자 — 선납 추가이자 없음");
  equal(oneEleven.netInterest, 96_248, "1-11 세후 이자 — 선납 추가이자 없음");
  equal(regular.idleInterest, 26_509, "정기 대기자금 세후 이자");
  equal(sixOneFive.idleInterest, 26_509, "6-1-5 대기자금 세후 이자");
  equal(oneEleven.idleInterest, 26_365, "1-11 대기자금 세후 이자");
  equal(regular.principal, 6_000_000, "총 원금");
  equal(sixOneFive.nextLargeAmount, 2_500_000, "6-1-5 다음 큰 납입액 단위");
  equal(oneEleven.nextLargeAmount, 5_500_000, "1-11 다음 큰 납입액 단위");
  equal(sixOneFive.netInterest, regular.netInterest, "6-1-5 순이연0 약정이자 유지");
  equal(oneEleven.netInterest, regular.netInterest, "1-11 순이연-5 약정이자 유지");
  equal(sixOneFive.interestIsConditional, false, "6-1-5 이자 조건 모델");
});

test("all approaches share the same evaluation horizon when a payment is moved past maturity", () => {
  const input = defaultPlanInput();
  const edited = buildSchedule(input.startDate, "615", input.monthlyAmount).map((item) => item.actualDate);
  edited[11] = "2027-11-01";
  const common = "2027-11-01";
  for (const kind of ["regular", "615", "111"] as const) {
    const planInput = { ...input, actualDates: kind === "615" ? edited : [] };
    equal(evaluatePlan(planInput, kind, input.monthlyAmount, common).evaluationEndDate, common, `${kind} 공통 평가기간`);
  }
});

test("cash flow after the common horizon is excluded from interest and starting cash accrues from signup", () => {
  const input = { ...defaultPlanInput(), cashNow: 12_000_000, incomes: "" };
  const base = evaluatePlan(input, "regular");
  const afterHorizon = evaluatePlan({ ...input, incomes: "2028-10-23,1" }, "regular");
  equal(afterHorizon.idleInterest, base.idleInterest, "평가 종료 뒤 유입 제외");
  const shifted = buildSchedule(input.startDate, "regular", input.monthlyAmount).map((item) => item.actualDate);
  shifted[0] = "2026-11-23";
  const lateFirst = evaluatePlan({ ...input, actualDates: shifted }, "regular");
  equal(lateFirst.idleInterest - base.idleInterest, 898, "가입일부터 보유 현금 이자");
});

test("cash-flow reverse solving respects future inflow dates and exact shortage date", () => {
  const input = { ...defaultPlanInput(), cashNow: 1_000_000, incomes: "" };
  const solved = affordableMonthlyAmount(input, "615");
  equal(solved.amount, 83_333, "현재 현금만으로 가능한 월 납입액");
  const amount = evaluatePlan({ ...input, monthlyAmount: 200_000 }, "615");
  equal(amount.cashShortageDate, "2026-10-23", "부족 발생일");
  equal(amount.cashShortageAmount, 200_000, "부족액");
  equal(amount.cashTimeline[0].date, input.startDate, "가입일 현금 잔액 시작");
  equal(amount.cashTimeline[0].closingBalance, -200_000, "6-1-5 첫 묶음 뒤 잔액");
});

test("missed installment is removed from principal, interest, and payment cash flows", () => {
  const input = defaultPlanInput();
  const schedule = buildSchedule(input.startDate, "615", input.monthlyAmount).map((item) => item.actualDate);
  schedule[6] = "";
  const result = evaluatePlan({ ...input, actualDates: schedule }, "615");
  equal(result.principal, 5_500_000, "누락 반영 원금");
  equal(result.installments[6].paid, false, "누락 상태");
  equal(result.hasMissedInstallments, true, "미납 영향 표시 상태");
  equal(result.interestIsConditional, true, "미납 이자 조건부 표시");
  equal(result.flows.some((flow) => flow.date === "2027-04-23" && flow.amount < 0), false, "누락 납입 현금흐름 제외");
  equal(validateInput({ ...input, actualDates: schedule }).length, 0, "누락일 일정 입력 허용");
});

test("invalid dates, zero and out-of-range amounts suppress calculation", () => {
  const input = defaultPlanInput();
  equal(validateInput({ ...input, startDate: "2026-02-30" }).length > 0, true, "잘못된 가입일 차단");
  equal(validateInput({ ...input, monthlyAmount: 0 }).length > 0, true, "0원 차단");
  equal(validateInput({ ...input, monthlyAmount: 1_000_000_001 }).length > 0, true, "월 납입 상한");
  equal(validateInput({ ...input, annualRate: 100.01 }).length > 0, true, "금리 상한");
  equal(validateInput({ ...input, incomes: "2027-04-23,-1" }).length > 0, true, "음수 유입 차단");
});

for (const [name, fn] of cases) { fn(); console.log(`통과: ${name}`); }
console.log(`${cases.length}개 선납이연 계산 검산 통과`);
