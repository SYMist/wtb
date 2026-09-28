import { isValidYm } from "./exchange-compare";

export type Point = { date: string; rate: number };

export type BaseRateMonthLookup =
  | { kind: "empty" }
  | { kind: "found"; point: Point }
  | { kind: "invalid"; requested: string }
  | { kind: "before-range"; requested: string }
  | { kind: "after-range"; requested: string }
  | { kind: "missing"; requested: string };

/** 배열 쿼리는 첫 값만 읽어, 폼의 단일 month 값과 같은 규칙으로 해석한다. */
export function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * 기준금리의 과거 월은 정확히 존재할 때만 보여준다.
 *
 * 비교 도구와 달리 가까운 월로 보정하지 않는다. 단일 월 조회에서 조용히 다른
 * 값을 보여주면 검색 사용자가 요청한 사실값을 확인할 수 없기 때문이다.
 */
export function resolveBaseRateMonth(
  series: Point[],
  requested: string | undefined,
): BaseRateMonthLookup {
  if (!requested) return { kind: "empty" };
  if (!isValidYm(requested)) return { kind: "invalid", requested };

  const first = series[0];
  const last = series[series.length - 1];

  if (requested < first.date) return { kind: "before-range", requested };
  if (requested > last.date) return { kind: "after-range", requested };

  const point = series.find((entry) => entry.date === requested);
  return point ? { kind: "found", point } : { kind: "missing", requested };
}
