/**
 * 시계열 fetch 스크립트 공용 머지·저장 헬퍼.
 *
 * 배경: 각 스크립트가 ECOS 응답으로 JSON을 통째로 덮어썼다. ECOS가 아직
 * 발행하지 않은 최신 월을 수동 반영해두면 다음 run이 그 행을 지운다
 * (2026-08-01 사고: 7/16 금통위 인상분 2026-07 2.75%가 리버트됨).
 * 외부 소스에 의존하는 자동화는 "소스에 아직 없을 때"의 동작이
 * 이전 값 보존이어야 한다 — 그 규칙을 여기 한 곳에 둔다.
 *
 * 머지 규칙
 *   ⓐ 이전 파일에만 있는 월은 보존한다(삭제 금지).
 *   ⓑ 같은 월이 양쪽에 있으면 수신(ECOS) 값이 이긴다 — 소스 정정 반영.
 *   ⓒ latest.date는 뒤로 못 간다 — 과거로 후퇴하면 실패로 보고 저장을 중단한다.
 *
 * 시각 두 종류를 분리해 기록한다.
 *   updatedAt = 데이터가 마지막으로 바뀐 날(값이 그대로면 보존).
 *   checkedAt = 원천을 마지막으로 확인한 날(매 run 갱신).
 * 하나로 합치면 "갱신일"이 과거로 후퇴한 것처럼 보이거나(2026-08-01 → 2026-07-17),
 * 반대로 값이 안 바뀌었는데 새로 나온 데이터인 척하게 된다.
 */

import { writeFileSync, readFileSync, existsSync } from "fs";

export interface Point {
  date: string; // "YYYY-MM"
  rate: number;
}

export interface Series {
  series: Point[];
  latest: Point;
  stats: {
    max: { date: string; rate: number };
    min: { date: string; rate: number };
    average: number;
  };
  /** 데이터 최종 변경일 (YYYY-MM-DD). */
  updatedAt: string;
  /** 원천 최종 확인일 (YYYY-MM-DD). 값이 안 바뀌어도 매 run 갱신된다. */
  checkedAt?: string;
  /**
   * 지수형 시계열의 기준연도(예: CPI 2020=100 → 2020). 지수 개편 시 값이 바뀐다.
   * 없으면(undefined) 이 시계열엔 기준연도 개념이 없다(금리·환율 등) — 가드 비활성.
   */
  baseYear?: number;
}

export function readPreviousSeries(outputPath: string): Series | null {
  if (!existsSync(outputPath)) return null;
  try {
    const prev = JSON.parse(readFileSync(outputPath, "utf-8")) as Series;
    return Array.isArray(prev?.series) ? prev : null;
  } catch {
    return null;
  }
}

/** 규칙 ⓐ·ⓑ. 결과는 date 오름차순 정렬. */
export function mergeSeries(
  previous: Point[] | null,
  incoming: Point[],
): Point[] {
  const byDate = new Map<string, number>();
  for (const p of previous ?? []) byDate.set(p.date, p.rate); // ⓐ 이전 월 보존
  for (const p of incoming) byDate.set(p.date, p.rate); // ⓑ 같은 월은 수신 값이 이김
  return Array.from(byDate, ([date, rate]) => ({ date, rate })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function computeStats(series: Point[]): Series["stats"] {
  const max = series.reduce((m, p) => (p.rate > m.rate ? p : m), series[0]);
  const min = series.reduce((m, p) => (p.rate < m.rate ? p : m), series[0]);
  const sum = series.reduce((s, p) => s + p.rate, 0);
  return {
    max,
    min,
    average: Math.round((sum / series.length) * 100) / 100,
  };
}

/**
 * 수신 시계열을 이전 파일과 머지해 저장한다.
 * 데이터가 실제로 바뀌지 않았으면 updatedAt을 보존한다(불필요한 커밋 방지).
 *
 * baseYear 가드: 지수형 시계열은 기준연도 개편(예: CPI 2020=100 → 2025=100)이
 * 오면 개편 전/후 값이 섞이면 안 된다. 규칙 ⓐ(이전 월 보존)가 정확히 이걸
 * 깨뜨린다 — incoming에 있는 월만 새 기준으로 덮이고 없는 월은 옛 기준값이
 * 그대로 남아 한 시계열에 신·구 기준이 혼재한다. options.baseYear가 이전
 * 파일의 baseYear와 다르면 부분 머지 대신 incoming으로 전량 재적재한다.
 */
export function saveSeries(
  outputPath: string,
  incoming: Point[],
  unit = "%",
  options: { baseYear?: number } = {},
): Series {
  if (incoming.length === 0) {
    throw new Error("빈 시계열은 저장하지 않습니다.");
  }

  const previous = readPreviousSeries(outputPath);
  const baseYearChanged =
    options.baseYear !== undefined &&
    previous?.baseYear !== undefined &&
    previous.baseYear !== options.baseYear;

  const series = baseYearChanged
    ? [...incoming].sort((a, b) => a.date.localeCompare(b.date))
    : mergeSeries(previous?.series ?? null, incoming);
  const latest = series[series.length - 1];

  // ⓒ latest 역행 = 소스 이상 or 머지 버그. 덮어쓰지 말고 실패시킨다.
  if (previous?.latest && latest.date.localeCompare(previous.latest.date) < 0) {
    throw new Error(
      `latest 역행 감지: ${previous.latest.date} → ${latest.date}. 저장을 중단합니다.`,
    );
  }

  const dataChanged =
    JSON.stringify(series) !== JSON.stringify(previous?.series ?? null);
  const today = new Date().toISOString().split("T")[0];

  const result: Series = {
    series,
    latest,
    stats: computeStats(series),
    updatedAt: dataChanged ? today : (previous?.updatedAt ?? today),
    checkedAt: today,
    ...(options.baseYear !== undefined
      ? { baseYear: options.baseYear }
      : previous?.baseYear !== undefined
        ? { baseYear: previous.baseYear }
        : {}),
  };
  writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n", "utf-8");

  const incomingDates = new Set(incoming.map((p) => p.date));
  const preserved = baseYearChanged
    ? 0
    : (previous?.series ?? []).filter((p) => !incomingDates.has(p.date)).length;
  if (baseYearChanged) {
    console.warn(
      `baseYear 변경 감지: ${previous!.baseYear} → ${options.baseYear}. 부분 머지 대신 전량 재적재했습니다(구 기준값 ${(previous?.series ?? []).length}개 폐기).`,
    );
  }
  console.log(
    `Saved ${series.length} points (${series[0].date} ~ ${latest.date}, latest=${latest.rate}${unit}, dataChanged=${dataChanged}, preserved=${preserved}, checkedAt=${today}${result.baseYear !== undefined ? `, baseYear=${result.baseYear}` : ""}) to ${outputPath}`,
  );
  return result;
}
