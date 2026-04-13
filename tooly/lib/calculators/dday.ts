export interface DdayResult {
  daysRemaining: number;
  isPast: boolean;
  weeksRemaining: number;
  targetDate: string;
}

export function calculateDday(targetDate: string, fromDate?: string): DdayResult {
  const target = new Date(targetDate);
  const from = fromDate ? new Date(fromDate) : new Date();

  // 시간 제거 (날짜만 비교)
  target.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);

  const diff = target.getTime() - from.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    daysRemaining: days,
    isPast: days < 0,
    weeksRemaining: Math.floor(Math.abs(days) / 7),
    targetDate,
  };
}
