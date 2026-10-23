"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { createPrepaymentActionTracker, type PrepaymentAction } from "@/lib/calculators/prepayment-deferral-analytics";
import {
  addDays, addMonths, affordableMonthlyAmount, buildSchedule, defaultPlanInput, evaluatePlan,
  PLAN_LABELS, validateInput, type PlanInput, type PlanKind, type PlanResult,
} from "@/lib/calculators/prepayment-deferral";

const money = (value: number) => `${Math.round(value).toLocaleString("ko-KR")}원`;
const inputClass = "mt-1 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary";

function download(name: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(value: string | number): string {
  const raw = String(value);
  return `"${raw.replaceAll('"', '""')}"`;
}

function toCsv(result: PlanResult): string {
  const header = ["회차", "납입 상태", "약정 납입일", "실제 납입일", "납입 금액(원)", "선납일수", "이연일수"];
  const rows = result.installments.map((item) => [item.number, item.paid ? "납입" : "누락", item.dueDate, item.actualDate, item.paid ? item.amount : 0, Math.max(0, item.days), Math.max(0, -item.days)]);
  return "\uFEFF" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n") + "\r\n";
}

function icsDate(date: string): string { return date.replaceAll("-", ""); }
function icsTimestampNow(): string { return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z"); }
function icsTextEscape(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replace(/\r\n|\r|\n/g, "\\n");
}
function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const output: string[] = [];
  let current = "";
  let bytes = 0;
  for (const character of line) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) { output.push(current); current = ` ${character}`; bytes = 1 + size; }
    else { current += character; bytes += size; }
  }
  output.push(current);
  return output.join("\r\n");
}
function toIcs(result: PlanResult): string {
  const events = result.installments.filter((item) => item.paid).map((item) => [
    "BEGIN:VEVENT", `UID:tooly-prepayment-${result.kind}-${item.number}@tooly.deluxo.co.kr`,
    `DTSTAMP:${icsTimestampNow()}`, `DTSTART;VALUE=DATE:${icsDate(item.actualDate)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(item.actualDate, 1))}`,
    `SUMMARY:${icsTextEscape(`선납이연 ${item.number}회차 납입`)}`,
    `DESCRIPTION:${icsTextEscape(`${result.label} / ${money(item.amount)} / 약정일 ${item.dueDate} / ${item.days > 0 ? `선납 ${item.days}일` : item.days < 0 ? `이연 ${-item.days}일` : "약정일 납입"}`)}`,
    "END:VEVENT",
  ].map(foldIcsLine).join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Tooly//Prepayment Deferral//KO", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...events, "END:VCALENDAR", ""].join("\r\n");
}

function Field({ label, value, onChange, type = "number", step, min, max, hint }: {
  label: string; value: string | number; onChange: (value: string) => void;
  type?: string; step?: string; min?: string; max?: string; hint?: string;
}) {
  return <label className="block min-w-0 text-sm font-medium text-text-primary">{label}<input className={inputClass} type={type} value={value} step={step} min={min} max={max} onChange={(event) => onChange(event.currentTarget.value)} />{hint && <span className="mt-1 block text-xs font-normal text-text-secondary">{hint}</span>}</label>;
}

function PlanCard({ result, selected, onSelect }: { result: PlanResult; selected: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={`min-w-0 rounded-xl border p-4 text-left ${selected ? "border-primary bg-primary-light/50 ring-1 ring-primary" : "border-border bg-background"}`}>
    <span className="text-sm font-semibold">{result.label}</span>
    <strong className="mt-2 block break-words text-xl text-text-primary">{money(result.firstNeed)}</strong>
    <span className="text-xs text-text-secondary">처음 필요한 금액</span>
    <span className="mt-3 block text-sm">다음 큰 납입: {result.nextLargeDate} · {money(result.nextLargeAmount)}</span>
    <span className="mt-1 block text-sm">적금 세후 이자 {result.interestIsConditional ? "조건부 추정 " : "추정 "}{money(result.netInterest)}</span>
    {result.interestIsConditional && <span className="mt-1 block text-xs text-amber-800">지연 또는 누락 영향은 상품 약관에서 확인하세요.</span>}
    {result.cashShortageDate && <span className="mt-2 block text-xs font-semibold text-red-700">{result.cashShortageDate}에 {money(result.cashShortageAmount)} 부족</span>}
    {!result.cashShortageDate && <span className="mt-2 block text-xs text-emerald-700">입력한 자금 일정으로 감당 가능</span>}
  </button>;
}

export default function PrepaymentDeferralClient() {
  const [input, setInput] = useState<PlanInput>(() => defaultPlanInput());
  const [selected, setSelected] = useState<PlanKind>("615");
  const [hasEditedSchedule, setHasEditedSchedule] = useState(false);
  const actionTracker = useMemo(() => createPrepaymentActionTracker((event) => trackEvent(event.name, event.params)), []);
  function trackAction(action: PrepaymentAction) { actionTracker(action); }
  const errors = useMemo(() => validateInput(input), [input]);
  const scheduleInput = useMemo(() => ({ ...input, actualDates: hasEditedSchedule ? input.actualDates : [] }), [input, hasEditedSchedule]);
  const sharedEndDate = useMemo(() => {
    if (errors.length) return undefined;
    const dates = (["regular", "615", "111"] as PlanKind[]).flatMap((kind) => buildSchedule(input.startDate, kind, input.monthlyAmount, kind === selected && hasEditedSchedule ? input.actualDates : []).filter((item) => item.paid).map((item) => item.actualDate));
    return [addMonths(input.startDate, 12), ...dates].sort().at(-1);
  }, [input, errors, selected, hasEditedSchedule]);
  const results = useMemo(() => errors.length ? null : (["regular", "615", "111"] as PlanKind[]).map((kind) => evaluatePlan({ ...scheduleInput, actualDates: kind === selected && hasEditedSchedule ? scheduleInput.actualDates : [] }, kind, input.monthlyAmount, sharedEndDate)), [scheduleInput, errors, selected, hasEditedSchedule, input.monthlyAmount, sharedEndDate]);
  const selectedResult = results?.find((item) => item.kind === selected) ?? null;
  const regular = results?.find((item) => item.kind === "regular");
  const balances = useMemo(() => errors.length ? null : (["regular", "615", "111"] as PlanKind[]).map((kind) => ({ kind, ...affordableMonthlyAmount({ ...input, actualDates: kind === selected && hasEditedSchedule ? input.actualDates : [] }, kind) })), [input, errors, selected, hasEditedSchedule]);

  function update<K extends keyof PlanInput>(key: K, value: PlanInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }
  function choose(kind: PlanKind) {
    setSelected(kind);
    setHasEditedSchedule(false);
    update("actualDates", []);
  }
  function editDate(index: number, date: string) {
    const dates = hasEditedSchedule ? [...input.actualDates] : buildSchedule(input.startDate, selected, input.monthlyAmount).map((item) => item.actualDate);
    dates[index] = date;
    update("actualDates", dates);
    setHasEditedSchedule(true);
    trackAction("schedule_edit");
  }
  function explicitCalculate() {
    if (errors.length) return;
    trackAction("calculate_compare");
  }

  return <>
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12">
      <header className="py-8 sm:py-10">
        <p className="text-sm font-semibold text-primary">12개월 정액적립식 시뮬레이션</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">선납이연 계산기</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">언제 얼마를 넣고, 현재 자금과 앞으로 들어올 돈으로 가능한지 확인하세요. 납입일을 바꾸면 잔액·이자 추정·순이연도 다시 계산합니다.</p>
      </header>

      <form onSubmit={(event) => { event.preventDefault(); explicitCalculate(); }} className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-bold">적금 조건</h2>
        <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="가입일" type="date" value={input.startDate} onChange={(value) => { update("startDate", value); setHasEditedSchedule(false); }} />
          <Field label="월 납입액" value={input.monthlyAmount} min="1" max="1000000000" onChange={(value) => update("monthlyAmount", value === "" ? NaN : Number(value))} />
          <Field label="적금 연이율 (%)" value={input.annualRate} min="0" max="100" step="0.01" onChange={(value) => update("annualRate", value === "" ? NaN : Number(value))} />
          <label className="block text-sm font-medium">세금 가정<select className={inputClass} value={input.tax} onChange={(event) => update("tax", event.currentTarget.value as PlanInput["tax"])}><option value="normal">일반과세 15.4%</option><option value="cooperativeExempt">조합 예탁금 1.4%</option><option value="cooperative2026">2026년 조합 예탁금 5.9%</option><option value="preferential">세금우대종합저축 9.5%</option><option value="taxFree">비과세종합저축 0%</option><option value="cooperativeRuralExempt">조합 예탁금 농특세 면제 0%</option></select></label>
        </div>
        <button type="submit" className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">조건 적용하고 방식 비교</button>
        {errors.length > 0 && <ul className="mt-3 list-inside list-disc text-sm text-red-700">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      </form>

      <section className="mt-6 rounded-2xl border border-border p-4 sm:p-6" aria-labelledby="funds-title">
        <h2 id="funds-title" className="text-lg font-bold">가용 자금과 운용 조건</h2>
        <p className="mt-1 text-sm text-text-secondary">지금 보유한 돈과 이후 자금 유입을 날짜별 납입과 대조합니다. 입력 오류를 고칠 수 있도록 조건이 잘못되어도 이 입력은 유지됩니다.</p>
        <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="지금 가용한 현금" value={input.cashNow} min="0" max="12000000000" onChange={(value) => update("cashNow", value === "" ? NaN : Number(value))} /><Field label="대기자금 연이율 (%)" value={input.idleRate} min="0" max="100" step="0.01" onChange={(value) => update("idleRate", value === "" ? NaN : Number(value))} hint="납입 전 남은 현금에만 단리로 적용" /><Field label="선택 입력: 대출 연이율 (%)" value={input.loanRate} min="0" max="100" step="0.01" onChange={(value) => update("loanRate", value === "" ? NaN : Number(value))} hint="단순 비용 예시이며 대출 이용을 권하지 않습니다." /></div>
        <label className="mt-4 block text-sm font-medium">앞으로 들어올 자금 <span className="font-normal text-text-secondary">(날짜,금액을 한 줄에 하나씩)</span><textarea className={`${inputClass} min-h-24 font-mono`} value={input.incomes} onChange={(event) => update("incomes", event.currentTarget.value)} placeholder="2027-04-23,3000000" /></label>
      </section>

      {results && selectedResult && <>
        <section className="mt-8" aria-labelledby="compare-title">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 id="compare-title" className="text-xl font-bold">같은 월 납입액으로 방식 비교</h2><p className="mt-1 text-sm text-text-secondary">월 {money(input.monthlyAmount)} · 12회 완납 시 원금 {money(input.monthlyAmount * 12)} · 선택 일정 실제 납입 {money(selectedResult.principal)} · 공통 평가 종료일 {selectedResult.evaluationEndDate}</p></div><span className="text-xs text-text-secondary">카드를 눌러 일정을 확인하고 수정</span></div>
          <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">{results.map((result) => <PlanCard key={result.kind} result={result} selected={selected === result.kind} onSelect={() => choose(result.kind)} />)}</div>
          <div className="mt-3 rounded-xl bg-surface p-4 text-sm leading-6 text-text-secondary">만기 영향((이연일수−선납일수)÷12회차)의 산술 추정: <strong className="text-text-primary">{selectedResult.hasMissedInstallments ? "납입 누락이 있어 만기·이자 결과 확인 필요" : selectedResult.netDeferredDays > 0 ? `${selectedResult.estimatedMaturityDate} 전후로 늦어질 수 있음` : "완납·순이연 0 이하 가정에서 약정 만기 유지"}</strong>. 상품의 실제 만기·지연이자를 보장하지 않습니다. 선납 {selectedResult.earlyDays.toLocaleString()}일 · 이연 {selectedResult.lateDays.toLocaleString()}일 · 순이연 {selectedResult.netDeferredDays.toLocaleString()}일. 정기 납입 대비 적금 세후 이자 차이 {money(selectedResult.netInterest - (regular?.netInterest ?? 0))}.</div>
        </section>

        <section className="mt-8 rounded-2xl border border-border p-4 sm:p-6" aria-labelledby="budget-title">
          <h2 id="budget-title" className="text-xl font-bold">내 자금으로 가능한 월 납입액</h2>
          <p className="mt-1 text-sm text-text-secondary">날짜별 납입액과 자금 유입을 시간 순서대로 대조합니다. 선택 일정에서 누락한 회차도 역산에 반영합니다. 상품의 회차별 납입 한도는 판정하지 않습니다.</p>
          <button type="button" onClick={() => trackAction("budget_reverse")} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold">현재 자금으로 월 납입액 역산</button>
          <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-3">{balances?.map(({ kind, amount, result }) => <div key={kind} className="rounded-xl bg-surface p-4"><h3 className="text-sm font-semibold">{PLAN_LABELS[kind]}</h3><p className="mt-2 text-xl font-bold">{money(amount)}<span className="text-sm font-normal"> / 월</span></p><p className="mt-1 text-xs text-text-secondary">계산 중 최저 잔액 {money(result.minCashBalance)} · 금액은 1원 단위 하향 탐색</p></div>)}</div>
          <h3 className="mt-6 text-base font-semibold">{PLAN_LABELS[selected]} 날짜별 현금 잔액</h3>
          <p className="mt-1 text-xs text-text-secondary">각 날짜의 시작 잔액에 자금 유입을 더하고 납입액을 뺀 뒤 잔액입니다.</p>
          <div className="mt-3 space-y-2 md:hidden">{selectedResult.cashTimeline.map((row) => <div key={row.date} className="rounded-lg bg-surface p-3 text-sm"><strong>{row.date}</strong><div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-text-secondary"><span>시작 {money(row.openingBalance)}</span><span>유입 +{money(row.inflow)}</span><span>납입 −{money(row.payment)}</span><span className={row.closingBalance < 0 ? "font-semibold text-red-700" : "font-semibold text-text-primary"}>잔액 {money(row.closingBalance)}</span></div></div>)}</div>
          <div className="mt-3 hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-text-secondary"><th className="p-2">날짜</th><th className="p-2">시작 잔액</th><th className="p-2">유입</th><th className="p-2">납입</th><th className="p-2">마감 잔액</th></tr></thead><tbody>{selectedResult.cashTimeline.map((row) => <tr className="border-b border-border" key={row.date}><td className="p-2">{row.date}</td><td className="p-2">{money(row.openingBalance)}</td><td className="p-2">{money(row.inflow)}</td><td className="p-2">{money(row.payment)}</td><td className={`p-2 ${row.closingBalance < 0 ? "font-semibold text-red-700" : ""}`}>{money(row.closingBalance)}</td></tr>)}</tbody></table></div>
        </section>

        <section className="mt-8 rounded-2xl border border-border p-4 sm:p-6" aria-labelledby="idle-title">
          <h2 id="idle-title" className="text-xl font-bold">대기자금 이자 비교</h2>
          <p className="mt-1 text-sm text-text-secondary">현재 현금과 위에 입력한 자금 유입을 세 방식에 똑같이 적용하고, 납입 뒤 남은 잔액만 계산합니다. 전체 원금을 첫날부터 보유한다고 가정하지 않습니다.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">{results.map((result) => <div className="rounded-xl bg-surface p-4" key={result.kind}><h3 className="text-sm font-semibold">{result.label}</h3><p className="mt-2 text-lg font-bold">대기자금 세후 이자 {money(result.idleInterest)}</p><p className="text-sm text-text-secondary">적금 세후 이자 {money(result.netInterest)}</p><p className="mt-1 text-xs text-text-secondary">정기 납입 대비 대기자금 차이 {money(result.idleInterest - (regular?.idleInterest ?? 0))}</p></div>)}</div>
          <p className="mt-4 text-sm text-text-secondary">선택 방식의 전액 차입 가정 비용: {money(selectedResult.loanCost)} · 실제 대출 잔액·상환일은 반영하지 않습니다.</p>
        </section>

        <section className="mt-8 rounded-2xl border border-border p-4 sm:p-6" aria-labelledby="schedule-title">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="schedule-title" className="text-xl font-bold">{PLAN_LABELS[selected]} 납입 일정</h2><p className="mt-1 text-sm text-text-secondary">회차별 실제 납입일을 조정하면 모든 결과에 반영됩니다.</p></div><div className="flex gap-2"><button type="button" onClick={() => { download("tooly-prepayment-deferral.csv", toCsv(selectedResult), "text/csv;charset=utf-8"); trackAction("csv_export"); }} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">CSV 저장</button><button type="button" onClick={() => { download("tooly-prepayment-deferral.ics", toIcs(selectedResult), "text/calendar;charset=utf-8"); trackAction("calendar_export"); }} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold">캘린더 저장</button></div></div>
          {selectedResult.installments.some((item) => item.actualDate > addMonths(input.startDate, 12)) && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">약정 만기 뒤 납입일이 있습니다. 순이연÷12회차로 산출한 조건부 예상 만기({selectedResult.estimatedMaturityDate})까지의 이자를 추정하며 실제 만기·납입 인정·지급은 상품에 확인해야 합니다.</p>}
          <p className="mt-4 text-xs text-text-secondary">납입을 건너뛰려면 해당 실제 납입일을 지우세요. 누락 회차는 원금·이자·현금흐름에서 제외하고 CSV에 누락으로 표시하며 캘린더 일정은 만들지 않습니다.</p>
          <div className="mt-4 space-y-2 md:hidden">{selectedResult.installments.map((item) => <div key={item.number} className="grid grid-cols-[3rem_1fr] gap-x-3 rounded-lg bg-surface p-3"><strong className="row-span-2 self-center">{item.number}회</strong><label className="text-xs text-text-secondary">실제 납입일<input aria-label={`${item.number}회차 실제 납입일`} className={inputClass} type="date" value={item.actualDate} onInput={(event) => editDate(item.number - 1, event.currentTarget.value)} /></label><span className="text-sm">{item.paid ? `${money(item.amount)} · 약정 ${item.dueDate} · ${item.days > 0 ? `선납 ${item.days}일` : item.days < 0 ? `이연 ${-item.days}일` : "약정일"}` : `납입 누락 · 약정 ${item.dueDate}`}</span></div>)}</div>
          <div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full text-left text-sm"><thead><tr className="border-b border-border text-text-secondary"><th className="p-2">회차</th><th className="p-2">약정일</th><th className="p-2">실제 납입일</th><th className="p-2">금액</th><th className="p-2">구분</th><th className="p-2">일수</th></tr></thead><tbody>{selectedResult.installments.map((item) => <tr className="border-b border-border" key={item.number}><td className="p-2">{item.number}</td><td className="p-2">{item.dueDate}</td><td className="p-2"><input aria-label={`${item.number}회차 실제 납입일`} className="max-w-40 rounded border border-border bg-background px-2 py-1" type="date" value={item.actualDate} onInput={(event) => editDate(item.number - 1, event.currentTarget.value)} /></td><td className="p-2">{item.paid ? money(item.amount) : "—"}</td><td className="p-2">{!item.paid ? "누락" : item.kind === "early" ? "선납" : item.kind === "late" ? "이연" : "약정일"}</td><td className="p-2">{item.paid ? `${Math.abs(item.days)}일` : "—"}</td></tr>)}</tbody></table></div>
        </section>
      </>}

      <section className="mt-8 rounded-2xl bg-surface p-4 sm:p-6">
        <h2 className="text-lg font-bold">계산 전제와 확인할 점</h2>
        <div className="mt-3 space-y-2 text-sm leading-6 text-text-secondary"><p>12개월 정액 납입, 가입일의 일자를 매월 약정일로 삼고 해당 일자가 없는 달은 월말로 처리합니다. 휴일은 조정하지 않으며 실제 상품 앱의 약정 회차·휴일 규칙을 확인하세요.</p><p>납입일을 지우면 그 회차를 누락으로 처리합니다. 원금·이자·자금 지출에서 제외하고 CSV에 누락으로 기록하며 캘린더 일정은 만들지 않습니다. 실제 미납 결과는 상품 약관을 확인하세요.</p><p>완납·순이연이 0 이하인 계획은 선납 기간만으로 약정 적금 이자가 늘어난다고 가정하지 않고, 월말 약정일에 정기 납입했을 때의 이자를 사용합니다. 순이연이 양수이거나 회차가 누락되면 표시는 조건부 추정입니다. 실제 입금일 산식·지연 처리·만기 연장은 상품별로 다릅니다.</p><p>세금은 기존 예적금 계산기의 일반과세 15.4%, 조합 예탁금 1.4%·5.9%·농특세 면제, 세금우대 9.5%, 비과세 0% 가정입니다. 가입 자격·세율·상품 한도를 판정하지 않습니다.</p><p>선납일수는 약정일−실제일, 이연일수는 실제일−약정일의 양수 합입니다. 만기 영향은 (이연일수−선납일수)÷12회차를 올림한 참고 추정입니다. 대기자금은 유입·납입 사이 양수 잔액에만 단리로 계산하고, 공통 종료일 뒤 유입은 비교 이자에서 제외합니다.</p><p>0원·음수 금액·100% 초과 금리·10억원 초과 월 납입액은 계산하지 않습니다. 납입일을 만기 뒤로 바꾸면 순이연으로 추정한 조건부 만기까지 이자를 계산하며, 실제 연장 여부는 상품 확인이 필요합니다. 날짜별 현금 잔액은 각 일자의 입금·납입 뒤 잔액으로 표시합니다.</p></div>
        <p className="mt-4 text-xs leading-5 text-text-secondary">공식 참고: <a className="underline" href="https://m.ibksb.co.kr/download/804721902" target="_blank" rel="noreferrer">IBK저축은행 정기적금 상품설명서</a> (준법감시인 심의필 제2025-322호, 2025-12-29~2026-12-28). 이 문서는 한 상품의 계산 근거 예시이며 전체 상품에 적용되는 규칙이 아닙니다. 상품 약관을 확인한 뒤 본인 조건을 입력하세요.</p>
        <p className="mt-3 text-sm">먼저 <a className="font-semibold text-primary underline" href="/finance/deposit-calculator">예적금 이자 계산기</a>에서 납입액·금리별 세후 이자를 살펴보세요.</p>
      </section>
    </main>
  </>;
}
