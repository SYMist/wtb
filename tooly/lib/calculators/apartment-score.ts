/**
 * 아파트 점수화 — 정수연 매수 의사결정 방법론(공유 엑셀)을 그대로 옮긴 산식.
 *
 * 산식은 다시 정하지 말 것(확정 전제). 출처: raw/web/apartment-scoring-logic.md
 * - 5개 기준 가중합: 거리×5 · 면적×4 · 컨디션×3 · 세대수×2 · 연식×1 (기본값)
 * - 거리 = (역점수 + 강남점수) / 2
 * - 벤치마크 평균/환산 임계값은 BENCHMARKS 한 곳에 모음(A안 — 확장 여지만 둠).
 *
 * 가중치 모델: 사용자가 5개 기준의 **우선순위**를 매기면 위에서부터 5·4·3·2·1점이
 * 배분된다(서로 다른 값, 각 최대 5점 = 1~5의 순열). 따라서 만점은 항상 75점 고정.
 *
 * 회귀: A유형(준공2002·역5·강남52·전용59·955세대·컨디션5) → 60.5 / 75점.
 */

export type CriterionKey = "distance" | "area" | "condition" | "households" | "age";

export interface ApartmentInput {
  /** 역까지 도보 분 (지도앱 도보 실수치) */
  stationMinutes: number;
  /** 강남역까지 분 (대중교통, 평일 오전 첫 경로 실수치) */
  gangnamMinutes: number;
  /** 전용면적 ㎡ */
  areaSqm: number;
  /** 준공연도 (YYYY) */
  builtYear: number;
  /** 세대수 */
  households: number;
  /** 컨디션 1~5 */
  condition: number;
}

export type Weights = Record<CriterionKey, number>;

/**
 * 벤치마크 평균값 + 환산 임계값 — 한 곳에 모음(상수 객체, A안).
 * 평균값(역 6분·강남 53.9분)은 정수연 데이터셋 평균 = 객관 근거라 고정.
 */
export const BENCHMARKS = {
  /** 역까지 도보 분 데이터셋 평균 */
  stationMinutesAvg: 6,
  /** 강남까지 분 데이터셋 평균 */
  gangnamMinutesAvg: 53.9,
  /** 면적 환산 경계 (㎡): 59 이하 / 59 초과 84 이하 / 84 초과 */
  areaSmall: 59,
  areaMedium: 84,
  /** 세대수 환산 경계: 600 미만 / 600~1000 미만 / 1000 이상 */
  householdsSmall: 600,
  householdsLarge: 1000,
  /** 연식 환산 경계(년): 5 미만 / 5~10 미만 / 10 이상 */
  ageNew: 5,
  ageMid: 10,
} as const;

export const CRITERIA: { key: CriterionKey; label: string }[] = [
  { key: "distance", label: "거리(교통)" },
  { key: "area", label: "면적" },
  { key: "condition", label: "컨디션" },
  { key: "households", label: "세대수" },
  { key: "age", label: "연식" },
];

/**
 * 정수연 관점 기본 우선순위 (가장 중요 → 가장 덜 중요).
 * 위에서부터 5·4·3·2·1점이 배분된다.
 */
export const DEFAULT_ORDER: CriterionKey[] = [
  "distance",
  "area",
  "condition",
  "households",
  "age",
];

/**
 * 우선순위 배열 → 가중치 맵. n개 기준이면 1순위 n점 … 마지막 1점.
 * 5개 기준이면 5·4·3·2·1 (서로 다른 값, 각 최대 5점). 만점 = Σ(5×가중치) = 75 고정.
 */
export function weightsFromOrder(order: CriterionKey[]): Weights {
  const n = order.length;
  return order.reduce((acc, key, i) => {
    acc[key] = n - i;
    return acc;
  }, {} as Weights);
}

/** 정수연 관점 기본 가중치 (앵커값) */
export const DEFAULT_WEIGHTS: Weights = weightsFromOrder(DEFAULT_ORDER);

/** 역점수 — 평균 6분 기준: <6 → 5점, ≥6 → 1점 */
export function stationScore(minutes: number): number {
  return minutes < BENCHMARKS.stationMinutesAvg ? 5 : 1;
}

/** 강남점수 — 평균 53.9분 기준: <53.9 → 4점, ≥53.9 → 2점 */
export function gangnamScore(minutes: number): number {
  return minutes < BENCHMARKS.gangnamMinutesAvg ? 4 : 2;
}

/** 거리점수 = (역점수 + 강남점수) / 2 (x.5 가능) */
export function distanceScore(stationMinutes: number, gangnamMinutes: number): number {
  return (stationScore(stationMinutes) + gangnamScore(gangnamMinutes)) / 2;
}

/** 면적점수 — 59 이하 → 3, 59 초과 84 이하 → 4, 84 초과 → 5 */
export function areaScore(sqm: number): number {
  if (sqm <= BENCHMARKS.areaSmall) return 3;
  if (sqm <= BENCHMARKS.areaMedium) return 4;
  return 5;
}

/** 세대수점수 — 600 미만 → 3, 600 이상 1000 미만 → 4, 1000 이상 → 5 */
export function householdsScore(n: number): number {
  if (n < BENCHMARKS.householdsSmall) return 3;
  if (n < BENCHMARKS.householdsLarge) return 4;
  return 5;
}

/**
 * 연식점수 — 연식 = 현재연도(동적) − 준공연도.
 * 5년 미만 → 5, 5~10년 미만 → 4, 10년 이상 → 3.
 * (엑셀은 2025 고정이지만 계산기는 "지금 평가" 도구라 현재연도 동적.)
 */
export function ageScore(builtYear: number, currentYear: number): number {
  const age = currentYear - builtYear;
  if (age < BENCHMARKS.ageNew) return 5;
  if (age < BENCHMARKS.ageMid) return 4;
  return 3;
}

export interface CriterionBreakdown {
  key: CriterionKey;
  label: string;
  /** 기준 점수 (1~5, 거리는 x.5 가능) */
  rawScore: number;
  /** 적용 가중치 */
  weight: number;
  /** 기여도 = rawScore × weight */
  contribution: number;
}

export interface ApartmentScoreResult {
  total: number;
  maxScore: number;
  breakdown: CriterionBreakdown[];
}

/** 기준별 원점수(1~5) 계산 */
export function rawScores(
  input: ApartmentInput,
  currentYear: number = new Date().getFullYear()
): Record<CriterionKey, number> {
  return {
    distance: distanceScore(input.stationMinutes, input.gangnamMinutes),
    area: areaScore(input.areaSqm),
    condition: input.condition,
    households: householdsScore(input.households),
    age: ageScore(input.builtYear, currentYear),
  };
}

/**
 * 총점 = Σ(기준점수 × 가중치), 만점 = Σ(5 × 가중치).
 * 같은 가중치 세트 내에서만 매물 비교(만점 변동 처리).
 */
export function calculateApartmentScore(
  input: ApartmentInput,
  weights: Weights = DEFAULT_WEIGHTS,
  currentYear: number = new Date().getFullYear()
): ApartmentScoreResult {
  const scores = rawScores(input, currentYear);

  const breakdown: CriterionBreakdown[] = CRITERIA.map(({ key, label }) => ({
    key,
    label,
    rawScore: scores[key],
    weight: weights[key],
    contribution: scores[key] * weights[key],
  }));

  const total = breakdown.reduce((sum, b) => sum + b.contribution, 0);
  const maxScore = CRITERIA.reduce((sum, { key }) => sum + 5 * weights[key], 0);

  return { total, maxScore, breakdown };
}
