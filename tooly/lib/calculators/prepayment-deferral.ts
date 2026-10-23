import { INTEREST_TAX_RATES } from "@/lib/data/tax-rates";
import type { TaxType } from "./deposit";

export type PlanKind = "regular" | "615" | "111";
export type TaxChoice = TaxType;

export interface PlanInput {
  startDate: string;
  monthlyAmount: number;
  annualRate: number;
  tax: TaxChoice;
  cashNow: number;
  idleRate: number;
  loanRate: number;
  incomes: string;
  actualDates: string[];
}

export interface Installment {
  number: number;
  dueDate: string;
  actualDate: string;
  amount: number;
  paid: boolean;
  days: number;
  kind: "early" | "late" | "onTime";
}

export interface PlanResult {
  kind: PlanKind;
  label: string;
  installments: Installment[];
  principal: number;
  preTaxInterest: number;
  tax: number;
  netInterest: number;
  firstNeed: number;
  nextLargeDate: string;
  nextLargeAmount: number;
  earlyDays: number;
  lateDays: number;
  netDeferredDays: number;
  estimatedMaturityDate: string;
  maturityIsEstimate: true;
  hasMissedInstallments: boolean;
  interestIsConditional: boolean;
  cashShortageDate: string | null;
  cashShortageAmount: number;
  minCashBalance: number;
  idleInterest: number;
  loanCost: number;
  evaluationEndDate: string;
  cashTimeline: { date: string; openingBalance: number; inflow: number; payment: number; closingBalance: number }[];
  flows: { date: string; amount: number; label: string }[];
}

const DAY = 86_400_000;
export const MAX_AMOUNT = 1_000_000_000;
export const TAX_RATES: Record<TaxChoice, number> = INTEREST_TAX_RATES;
export const PLAN_LABELS: Record<PlanKind, string> = { regular: "정기 납입", "615": "6-1-5", "111": "1-11" };

function parseDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const [y, m, d] = value.split("-").map(Number);
  const date = Date.UTC(y, m - 1, d);
  const parsed = new Date(date);
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d ? date : NaN;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return formatDate(parseDate(date) + days * DAY);
}

export function addMonths(date: string, count: number): string {
  const ts = parseDate(date);
  const parsed = new Date(ts);
  const target = Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + count, 1);
  const lastDay = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + count + 1, 0)).getUTCDate();
  return formatDate(target + (Math.min(parsed.getUTCDate(), lastDay) - 1) * DAY);
}

export function dueDates(startDate: string): string[] {
  const start = parseDate(startDate);
  if (!Number.isFinite(start)) return [];
  const d = new Date(start);
  const day = d.getUTCDate();
  return Array.from({ length: 12 }, (_, offset) => {
    const monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1);
    const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset + 1, 0)).getUTCDate();
    return formatDate(monthStart + (Math.min(day, lastDay) - 1) * DAY);
  });
}

function dayDiff(later: string, earlier: string): number {
  return Math.round((parseDate(later) - parseDate(earlier)) / DAY);
}

function nearestBalancedDate(due: string[], earlySlots: number[], lateSlots: number[]): string {
  const earliest = parseDate(due[Math.max(...earlySlots)]);
  const latest = parseDate(due[11]) + 60 * DAY;
  let best = earliest;
  let foundNonPositive = false;
  for (let timestamp = earliest; timestamp <= latest; timestamp += DAY) {
    const date = formatDate(timestamp);
    const signed = earlySlots.reduce((sum, index) => sum + dayDiff(due[0], due[index]), 0)
      + lateSlots.reduce((sum, index) => sum + dayDiff(date, due[index]), 0);
    if (signed <= 0) { best = timestamp; foundNonPositive = true; }
  }
  return formatDate(foundNonPositive ? best : earliest);
}

export function buildSchedule(startDate: string, kind: PlanKind, amount: number, actualDates: string[] = []): Installment[] {
  const due = dueDates(startDate);
  if (due.length !== 12) return [];
  const dates = [...due];
  if (kind === "615") {
    for (let i = 0; i < 6; i++) dates[i] = startDate;
    dates[6] = due[6];
    const lastDate = nearestBalancedDate(due, [0, 1, 2, 3, 4, 5], [7, 8, 9, 10, 11]);
    for (let i = 7; i < 12; i++) dates[i] = lastDate;
  } else if (kind === "111") {
    dates[0] = startDate;
    const lastDate = nearestBalancedDate(due, [0], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    for (let i = 1; i < 12; i++) dates[i] = lastDate;
  }
  return due.map((dueDate, i) => {
    const actualDate = actualDates[i] === undefined ? dates[i] : actualDates[i];
    const paid = Boolean(actualDate);
    const days = paid ? dayDiff(dueDate, actualDate) : 0;
    return { number: i + 1, dueDate, actualDate, amount, paid, days, kind: days > 0 ? "early" : days < 0 ? "late" : "onTime" };
  });
}

export function parseIncomes(value: string): { date: string; amount: number }[] {
  if (!value.trim()) return [];
  return value.split(/\r?\n/).map((line) => {
    const [date = "", raw = ""] = line.split(",").map((part) => part.trim());
    return { date, amount: Number(raw) };
  });
}

export function validateInput(input: PlanInput): string[] {
  const errors: string[] = [];
  if (!dueDates(input.startDate).length) errors.push("올바른 가입일을 입력하세요.");
  if (!Number.isFinite(input.monthlyAmount) || input.monthlyAmount <= 0 || input.monthlyAmount > MAX_AMOUNT) errors.push("월 납입액은 1원 이상 10억원 이하여야 합니다.");
  for (const [label, value] of [["적금 연이율", input.annualRate], ["대기자금 연이율", input.idleRate], ["선택 대출 연이율", input.loanRate]] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 100) errors.push(`${label}은 0~100%로 입력하세요.`);
  }
  if (!Number.isFinite(input.cashNow) || input.cashNow < 0 || input.cashNow > MAX_AMOUNT * 12) errors.push("현재 가용 현금은 0~120억원으로 입력하세요.");
  const incomes = parseIncomes(input.incomes);
  if (incomes.some((entry) => !Number.isFinite(parseDate(entry.date)) || !Number.isFinite(entry.amount) || entry.amount <= 0 || entry.amount > MAX_AMOUNT * 12)) errors.push("유입 자금은 YYYY-MM-DD,금액 형식으로, 날짜와 양수 금액을 확인하세요.");
  if (incomes.some((entry) => Number.isFinite(parseDate(entry.date)) && parseDate(entry.date) < parseDate(input.startDate))) errors.push("자금 유입일은 가입일 이후로 입력하세요.");
  if (input.actualDates.length !== 0 && (input.actualDates.length !== 12 || input.actualDates.some((date) => date !== "" && !Number.isFinite(parseDate(date))))) errors.push("회차별 실제 납입일을 확인하세요.");
  if (input.actualDates.some((date) => date !== "" && Number.isFinite(parseDate(date)) && parseDate(date) < parseDate(input.startDate))) errors.push("실제 납입일은 가입일보다 앞설 수 없습니다.");
  return errors;
}

function interestFor(schedule: Installment[], annualRate: number, tax: TaxChoice, maturity: string, estimatedMaturity: string, preserveContractInterest: boolean) {
  const maturityTs = parseDate(preserveContractInterest ? maturity : estimatedMaturity);
  const preTaxInterest = schedule.reduce((sum, item) => {
    if (!item.paid) return sum;
    const interestStart = preserveContractInterest || item.actualDate < item.dueDate ? item.dueDate : item.actualDate;
    const days = Math.max(0, Math.floor((maturityTs - parseDate(interestStart)) / DAY));
    return sum + Math.floor(item.amount * annualRate / 100 * days / 365);
  }, 0);
  const taxAmount = Math.floor(preTaxInterest * TAX_RATES[tax]);
  return { preTaxInterest, tax: taxAmount, netInterest: preTaxInterest - taxAmount };
}

function calculateIdleInterest(flows: { date: string; amount: number; label: string }[], cashNow: number, annualRate: number, startDate: string, endDate: string, tax: TaxChoice): number {
  const boundedFlows = flows.filter((flow) => flow.date <= endDate);
  const ordered = [
    { date: startDate, amount: cashNow, label: "현재 현금" },
    ...boundedFlows,
    { date: endDate, amount: 0, label: "평가 종료" },
  ].sort((a, b) => parseDate(a.date) - parseDate(b.date) || b.amount - a.amount);
  let balance = 0;
  let interest = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    const event = ordered[i];
    balance += event.amount;
    const days = Math.max(0, dayDiff(ordered[i + 1].date, event.date));
    interest += Math.max(0, balance) * annualRate / 100 * days / 365;
  }
  return Math.floor(interest * (1 - TAX_RATES[tax]));
}

export function evaluatePlan(input: PlanInput, kind: PlanKind, amount = input.monthlyAmount, sharedEndDate?: string): PlanResult {
  const installments = buildSchedule(input.startDate, kind, amount, input.actualDates);
  const maturity = addMonths(input.startDate, 12);
  const principal = installments.reduce((sum, item) => sum + (item.paid ? item.amount : 0), 0);
  const hasMissedInstallments = installments.some((item) => !item.paid);
  const grouped = new Map<string, number>();
  for (const item of installments) if (item.paid) grouped.set(item.actualDate, (grouped.get(item.actualDate) ?? 0) + item.amount);
  const incomes = parseIncomes(input.incomes);
  const flows = [
    ...incomes.map((entry) => ({ ...entry, label: "자금 유입" })),
    ...[...grouped].map(([date, value]) => ({ date, amount: -value, label: "적금 납입" })),
  ].sort((a, b) => parseDate(a.date) - parseDate(b.date) || b.amount - a.amount);
  let balance = input.cashNow;
  let minCashBalance = balance;
  let cashShortageDate: string | null = null;
  let cashShortageAmount = 0;
  for (const flow of flows) {
    balance += flow.amount;
    minCashBalance = Math.min(minCashBalance, balance);
    if (balance < 0 && !cashShortageDate) { cashShortageDate = flow.date; cashShortageAmount = -balance; }
  }
  const earlyDays = installments.reduce((sum, item) => sum + Math.max(0, item.days), 0);
  const lateDays = installments.reduce((sum, item) => sum + Math.max(0, -item.days), 0);
  const netDeferredDays = lateDays - earlyDays;
  const estimatedMaturityDate = netDeferredDays > 0 ? addDays(maturity, Math.ceil(netDeferredDays / 12)) : maturity;
  const interestIsConditional = hasMissedInstallments || netDeferredDays > 0;
  const interest = interestFor(installments, input.annualRate, input.tax, maturity, estimatedMaturityDate, !interestIsConditional);
  const countByDate = new Map<string, number>();
  for (const item of installments) if (item.paid) countByDate.set(item.actualDate, (countByDate.get(item.actualDate) ?? 0) + 1);
  const largePayments = [...countByDate].filter(([, count]) => count > 1).sort(([a], [b]) => a.localeCompare(b));
  const firstNeed = grouped.get(input.startDate) ?? 0;
  const nextLarge = largePayments.map(([date, count]) => [date, count * amount] as [string, number]).find(([date]) => date > input.startDate)
    ?? (kind === "regular" ? [dueDates(input.startDate)[1], amount] as [string, number] : largePayments[0] ? [largePayments[0][0], largePayments[0][1] * amount] as [string, number] : undefined);
  const endDate = sharedEndDate ?? ([maturity, ...installments.filter((item) => item.paid).map((item) => item.actualDate)].sort().at(-1) ?? maturity);
  const idleInterest = calculateIdleInterest(flows, input.cashNow, input.idleRate, input.startDate, endDate, input.tax);
  const loanCost = Math.floor(principal * input.loanRate / 100 * Math.max(0, dayDiff(endDate, input.startDate)) / 365);
  const cashEvents = new Map<string, { inflow: number; payment: number }>([[input.startDate, { inflow: 0, payment: 0 }]]);
  for (const flow of flows) {
    const event = cashEvents.get(flow.date) ?? { inflow: 0, payment: 0 };
    if (flow.amount >= 0) event.inflow += flow.amount;
    else event.payment += -flow.amount;
    cashEvents.set(flow.date, event);
  }
  let timelineBalance = input.cashNow;
  const cashTimeline = [...cashEvents].sort(([a], [b]) => a.localeCompare(b)).map(([date, event]) => {
    const openingBalance = timelineBalance;
    timelineBalance += event.inflow - event.payment;
    return { date, openingBalance, inflow: event.inflow, payment: event.payment, closingBalance: timelineBalance };
  });
  return {
    kind, label: PLAN_LABELS[kind], installments, principal, ...interest, firstNeed,
    nextLargeDate: nextLarge?.[0] ?? maturity, nextLargeAmount: nextLarge?.[1] ?? amount,
    earlyDays, lateDays, netDeferredDays, estimatedMaturityDate, maturityIsEstimate: true, hasMissedInstallments, interestIsConditional,
    cashShortageDate, cashShortageAmount, minCashBalance, idleInterest, loanCost, evaluationEndDate: endDate, cashTimeline, flows,
  };
}

export function affordableMonthlyAmount(input: PlanInput, kind: PlanKind): { amount: number; result: PlanResult } {
  let low = 0;
  let high = MAX_AMOUNT;
  for (let i = 0; i < 42; i++) {
    const mid = Math.floor((low + high + 1) / 2);
    const result = evaluatePlan(input, kind, mid);
    if (result.minCashBalance >= 0) low = mid;
    else high = mid - 1;
  }
  return { amount: low, result: evaluatePlan(input, kind, low) };
}

export function defaultPlanInput(): PlanInput {
  return { startDate: "2026-10-23", monthlyAmount: 500_000, annualRate: 3.5, tax: "normal", cashNow: 3_000_000, idleRate: 2.5, loanRate: 0, incomes: "2027-04-23,3000000", actualDates: [] };
}
