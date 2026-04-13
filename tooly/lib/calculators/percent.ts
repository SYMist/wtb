/** A의 B%는? */
export function percentOf(a: number, b: number): number {
  return Math.round((a * b / 100) * 100) / 100;
}

/** A는 B의 몇 %? */
export function whatPercent(a: number, b: number): number {
  if (b === 0) return 0;
  return Math.round((a / b) * 10000) / 100;
}

/** A에서 B로 변할 때 변화율 */
export function percentChange(from: number, to: number): number {
  if (from === 0) return 0;
  return Math.round(((to - from) / Math.abs(from)) * 10000) / 100;
}
