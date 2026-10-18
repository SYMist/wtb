export type BaseRateDecision = { date: string; rate: number };
export type BaseRateDecisionSnapshot = {
  sourceUrl: string;
  series: BaseRateDecision[];
  checkedAt: string;
  firstChangeDate: string;
  lastChangeDate: string;
};

export type BaseRateDateResult =
  | { kind: "empty" }
  | { kind: "invalid"; requested: string }
  | { kind: "before-range"; requested: string }
  | { kind: "after-range"; requested: string }
  | { kind: "found"; requested: string; point: BaseRateDecision; system: string };

export function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function resolveBaseRateDate(
  snapshot: BaseRateDecisionSnapshot,
  requested: string | undefined,
): BaseRateDateResult {
  if (!requested) return { kind: "empty" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requested)) {
    return { kind: "invalid", requested };
  }
  const date = new Date(`${requested}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== requested) {
    return { kind: "invalid", requested };
  }
  if (requested < snapshot.firstChangeDate) return { kind: "before-range", requested };
  if (requested > snapshot.checkedAt) return { kind: "after-range", requested };
  let point: BaseRateDecision | undefined;
  for (const decision of snapshot.series) {
    if (decision.date > requested) break;
    point = decision;
  }
  if (!point) return { kind: "before-range", requested };
  return {
    kind: "found",
    requested,
    point,
    system: requested < "2008-03-01" ? "콜금리 목표" : "한국은행 기준금리",
  };
}

export function parseBaseRateDecisionRows(html: string): BaseRateDecision[] {
  const table = html.match(/<table[^>]*>[\s\S]*?<caption>\s*한국은행 기준금리 추이\s*<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i)?.[1];
  if (!table) throw new Error("한국은행 기준금리 변경 이력 표를 찾지 못했습니다.");
  const rows: BaseRateDecision[] = [];
  const rowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match: RegExpExecArray | null;
  while ((match = rowPattern.exec(table))) {
    const cells = [...match[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) =>
      cell[1].replace(/<[^>]+>/g, "").replace(/&nbsp;|&#160;/g, " ").trim(),
    );
    if (cells.length !== 3) continue;
    const year = Number(cells[0]);
    const dateParts = cells[1].match(/^(\d{1,2})월\s*(\d{1,2})일$/);
    const rate = Number(cells[2]);
    if (!Number.isInteger(year) || !dateParts || !Number.isFinite(rate)) {
      throw new Error(`잘못된 기준금리 변경 행: ${cells.join(" | ")}`);
    }
    const date = `${year}-${dateParts[1].padStart(2, "0")}-${dateParts[2].padStart(2, "0")}`;
    const parsed = new Date(`${date}T00:00:00Z`);
    if (parsed.toISOString().slice(0, 10) !== date || rate <= 0 || rate > 30) {
      throw new Error(`범위 밖 기준금리 변경 행: ${date} ${rate}`);
    }
    rows.push({ date, rate });
  }
  rows.reverse(); // 한국은행 페이지는 최신일이 먼저다.
  validateBaseRateDecisions(rows);
  return rows;
}

export function validateBaseRateDecisions(rows: BaseRateDecision[]): void {
  if (rows.length < 2) throw new Error("기준금리 변경 자료가 너무 적습니다.");
  const seen = new Set<string>();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (seen.has(row.date)) throw new Error(`중복 변경일: ${row.date}`);
    seen.add(row.date);
    if (i > 0 && rows[i - 1].date >= row.date) {
      throw new Error("기준금리 변경일이 오름차순이 아니거나 중복되었습니다.");
    }
    if (i > 0 && rows[i - 1].rate === row.rate) {
      throw new Error(`금리가 바뀌지 않은 행: ${row.date}`);
    }
  }
  const expected = [
    ["2008-08-07", 5.25],
    ["2008-10-09", 5],
    ["2008-10-27", 4.25],
    ["2020-05-28", 0.5],
  ] as const;
  for (const [date, rate] of expected) {
    if (!rows.some((row) => row.date === date && row.rate === rate)) {
      throw new Error(`기준금리 공식 행 경계 검증 실패: ${date} ${rate}`);
    }
  }
}

export function assertNoOfficialHistoryLoss(
  previous: BaseRateDecisionSnapshot,
  incoming: BaseRateDecisionSnapshot,
): void {
  if (incoming.lastChangeDate < previous.lastChangeDate) {
    throw new Error(`최신 변경일 후퇴: ${previous.lastChangeDate} → ${incoming.lastChangeDate}.`);
  }
  const incomingByDate = new Map(incoming.series.map((point) => [point.date, point.rate]));
  for (const prior of previous.series) {
    if (incomingByDate.get(prior.date) !== prior.rate) {
      throw new Error(`기존 공식 행 누락 또는 변경: ${prior.date} ${prior.rate}.`);
    }
  }
}
