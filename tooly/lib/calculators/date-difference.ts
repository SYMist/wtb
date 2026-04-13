export interface DateDiffResult {
  totalDays: number;
  weeks: number;
  remainderDays: number;
  months: number;
  years: number;
}

export function calculateDateDifference(
  startDate: string,
  endDate: string
): DateDiffResult {
  const start = new Date(startDate);
  const end = new Date(endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  // 월/년 차이 계산
  const earlier = start < end ? start : end;
  const later = start < end ? end : start;

  let months = (later.getFullYear() - earlier.getFullYear()) * 12 +
    (later.getMonth() - earlier.getMonth());
  if (later.getDate() < earlier.getDate()) months--;

  const years = Math.floor(months / 12);

  return { totalDays, weeks, remainderDays, months, years };
}
