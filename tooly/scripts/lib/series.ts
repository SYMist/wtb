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
  updatedAt: string;
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
 */
export function saveSeries(
  outputPath: string,
  incoming: Point[],
  unit = "%",
): Series {
  if (incoming.length === 0) {
    throw new Error("빈 시계열은 저장하지 않습니다.");
  }

  const previous = readPreviousSeries(outputPath);
  const series = mergeSeries(previous?.series ?? null, incoming);
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
  };
  writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n", "utf-8");

  const incomingDates = new Set(incoming.map((p) => p.date));
  const preserved = (previous?.series ?? []).filter(
    (p) => !incomingDates.has(p.date),
  ).length;
  console.log(
    `Saved ${series.length} points (${series[0].date} ~ ${latest.date}, latest=${latest.rate}${unit}, dataChanged=${dataChanged}, preserved=${preserved}) to ${outputPath}`,
  );
  return result;
}
