/** 2026년 대한민국 법정 공휴일 (대체공휴일 포함) */
export const HOLIDAYS_2026: string[] = [
  "2026-01-01", // 신정
  "2026-02-16", // 설날 전날
  "2026-02-17", // 설날
  "2026-02-18", // 설날 다음날
  "2026-03-01", // 삼일절
  "2026-05-05", // 어린이날
  "2026-05-24", // 석가탄신일
  "2026-06-06", // 현충일
  "2026-08-15", // 광복절
  "2026-09-24", // 추석 전날
  "2026-09-25", // 추석
  "2026-09-26", // 추석 다음날
  "2026-10-03", // 개천절
  "2026-10-09", // 한글날
  "2026-12-25", // 크리스마스
];

const holidaySet = new Set(HOLIDAYS_2026);

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface WorkdayResult {
  totalDays: number;
  workdays: number;
  weekends: number;
  holidays: number;
}

export function calculateWorkdays(
  startDate: string,
  endDate: string
): WorkdayResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const earlier = start <= end ? start : end;
  const later = start <= end ? end : start;

  let totalDays = 0;
  let weekends = 0;
  let holidays = 0;

  const current = new Date(earlier);
  while (current <= later) {
    totalDays++;
    const dateStr = formatDate(current);
    if (isWeekend(current)) {
      weekends++;
    } else if (holidaySet.has(dateStr)) {
      holidays++;
    }
    current.setDate(current.getDate() + 1);
  }

  const workdays = totalDays - weekends - holidays;

  return { totalDays, workdays, weekends, holidays };
}
