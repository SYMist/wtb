/**
 * 대한민국 법정 공휴일 (대체공휴일 포함).
 *
 * 새 연도 데이터 추가 방법:
 *   1. 매년 정부(인사혁신처) 발표 또는 한국천문연구원 자료 참고
 *   2. 아래 `HOLIDAYS_BY_YEAR`에 `YYYY: [...]` 항목 추가
 *   3. 알려진 연도 외에 입력되면 weekday/총일수 계산은 정확하지만
 *      해당 연도의 공휴일은 0으로 집계됨
 */

const HOLIDAYS_BY_YEAR: Record<number, string[]> = {
  2026: [
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
  ],
};

const holidaySetCache = new Map<number, Set<string>>();

function getHolidaySet(year: number): Set<string> {
  let cached = holidaySetCache.get(year);
  if (!cached) {
    cached = new Set(HOLIDAYS_BY_YEAR[year] ?? []);
    holidaySetCache.set(year, cached);
  }
  return cached;
}

export function isHolidayDataAvailable(year: number): boolean {
  return year in HOLIDAYS_BY_YEAR;
}

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
  /** 공휴일 데이터가 없는 연도 목록 (집계는 0으로 처리) */
  missingHolidayYears: number[];
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
  const missingYears = new Set<number>();

  const current = new Date(earlier);
  while (current <= later) {
    totalDays++;
    const year = current.getFullYear();
    const dateStr = formatDate(current);
    if (isWeekend(current)) {
      weekends++;
    } else if (getHolidaySet(year).has(dateStr)) {
      holidays++;
    } else if (!isHolidayDataAvailable(year)) {
      missingYears.add(year);
    }
    current.setDate(current.getDate() + 1);
  }

  const workdays = totalDays - weekends - holidays;

  return {
    totalDays,
    workdays,
    weekends,
    holidays,
    missingHolidayYears: [...missingYears].sort(),
  };
}

/** Backwards-compat: legacy direct array import */
export const HOLIDAYS_2026 = HOLIDAYS_BY_YEAR[2026] ?? [];
