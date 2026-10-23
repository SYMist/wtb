import { createPrepaymentActionTracker, prepaymentActionEvent } from "./prepayment-deferral-analytics";

let now = 1000;
const sent: ReturnType<typeof prepaymentActionEvent>[] = [];
const track = createPrepaymentActionTracker((event) => sent.push(event), () => now);
if (!track("calculate_compare") || track("calculate_compare")) throw new Error("연속 명시 동작을 750ms 동안 한 번만 기록해야 합니다.");
if (!track("schedule_edit")) throw new Error("서로 다른 명시 동작은 별도 기록해야 합니다.");
for (const origin of ["budget_reverse", "csv_export", "calendar_export"] as const) {
  if (!track(origin)) throw new Error(`${origin} 명시 행동 이벤트가 기록되어야 합니다.`);
}
now += 751;
if (!track("calculate_compare")) throw new Error("750ms 이후 반복 계산을 기록해야 합니다.");
const expected = [
  prepaymentActionEvent("calculate_compare"),
  prepaymentActionEvent("schedule_edit"),
  prepaymentActionEvent("budget_reverse"),
  prepaymentActionEvent("csv_export"),
  prepaymentActionEvent("calendar_export"),
  prepaymentActionEvent("calculate_compare"),
];
if (JSON.stringify(sent) !== JSON.stringify(expected)) throw new Error("행동 이벤트에 고정 문맥 이외의 값이 포함되었거나 순서가 다릅니다.");
console.log("선납이연 명시 행동 이벤트 payload·중복 억제 검산 통과");
