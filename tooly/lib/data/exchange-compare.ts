/**
 * 환율 두 시점 비교·환산 계산.
 *
 * 🔴 단위 급소: jpykrw 시계열은 "100엔당 원"이다(2026-07 = 921.46원 = 1엔 9.21원).
 * 그래서 환산은 rate를 그대로 곱/나누지 않고 반드시 `unit`(USD·CNY·EUR 1, JPY 100)으로
 * 정규화한다. USD와 같은 코드로 처리하면 JPY 결과가 100배 틀린다.
 *
 * 🔴 구간 급소: 통화별 데이터 시작월이 다르다(USD·JPY 1980-01 / EUR 1999-01 / CNY 2006-01).
 * 범위 밖 요청은 하한·상한으로 클램프하되, 보정 사실을 호출부가 화면에 표시할 수 있도록
 * `adjusted` 정보를 함께 돌려준다(조용히 다른 달을 보여주면 안 된다).
 */

export type Point = { date: string; rate: number };

export type SeriesData = {
  series: Point[];
  latest: Point;
  stats: {
    max: Point;
    min: Point;
    average: number;
  };
  updatedAt: string;
  checkedAt?: string;
};

export const CURRENCY_CODES = ["usd", "jpy", "cny", "eur"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export interface CurrencyMeta {
  code: CurrencyCode;
  /** 통화 정식 이름 — "원/미국달러". */
  name: string;
  /** 짧은 이름 — 프로즈용. */
  short: string;
  /** 외화 금액 단위 이름 — "달러", "엔". */
  unitName: string;
  /**
   * 시계열 rate 1단위가 몇 외화에 해당하는지. JPY만 100(=100엔당 원), 나머지 1.
   * 환산식은 전부 이 값을 통과한다.
   */
  unit: number;
  /** 화면 라벨 — "1달러당", "100엔당". */
  quoteLabel: string;
  /** 시계열 상세 페이지 경로. */
  seriesPath: string;
  /** 결과 카드에서 쓰는 기본 외화 금액(그 통화에서 자연스러운 단위). */
  defaultForeignAmount: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyMeta> = {
  usd: {
    code: "usd",
    name: "원/미국달러",
    short: "달러",
    unitName: "달러",
    unit: 1,
    quoteLabel: "1달러당",
    seriesPath: "/data/exchange/usd-krw",
    defaultForeignAmount: 100,
  },
  jpy: {
    code: "jpy",
    name: "원/일본엔",
    short: "엔",
    unitName: "엔",
    unit: 100,
    quoteLabel: "100엔당",
    seriesPath: "/data/exchange/jpy-krw",
    defaultForeignAmount: 100,
  },
  cny: {
    code: "cny",
    name: "원/중국위안",
    short: "위안",
    unitName: "위안",
    unit: 1,
    quoteLabel: "1위안당",
    seriesPath: "/data/exchange/cny-krw",
    defaultForeignAmount: 100,
  },
  eur: {
    code: "eur",
    name: "원/유로",
    short: "유로",
    unitName: "유로",
    unit: 1,
    quoteLabel: "1유로당",
    seriesPath: "/data/exchange/eur-krw",
    defaultForeignAmount: 100,
  },
};

/** 원화 고정 환산의 기준 금액(100만원). */
export const KRW_BASE_AMOUNT = 1_000_000;

const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

export function isValidYm(ym: string | undefined | null): ym is string {
  return typeof ym === "string" && YM.test(ym);
}

/** "YYYY-MM"에 개월수를 더한다(음수 가능). 달력 연산이지 문자열 연산이 아니다. */
export function shiftMonths(ym: string, months: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/**
 * 한글 조사 선택. 통화·금액 문자열이 데이터에서 조립되므로("1,497.43원", "달러", "엔")
 * 조사를 고정해두면 통화를 바꿀 때마다 문장이 틀린다.
 * 마지막 글자가 한글이 아니면(숫자·영문) 받침 없는 형태를 쓴다.
 */
export function josa(word: string, kind: "은는" | "을를" | "이가" | "로"): string {
  const forms = {
    은는: ["는", "은"],
    을를: ["를", "을"],
    이가: ["가", "이"],
    로: ["로", "으로"],
  }[kind];

  const ch = word.trim().slice(-1);
  const code = ch.charCodeAt(0);
  if (Number.isNaN(code) || code < HANGUL_START || code > HANGUL_END) {
    return forms[0];
  }
  const finalConsonant = (code - HANGUL_START) % 28;
  // ㄹ 받침은 "로"를 쓴다(2026년 7월로). 은/는·을/를에는 예외가 없다.
  if (finalConsonant === 8 && kind === "로") return "로";
  return finalConsonant === 0 ? forms[0] : forms[1];
}

export type MonthAdjustment =
  | { kind: "none" }
  /** 요청월이 데이터 시작 이전 — 하한월로 보정. */
  | { kind: "clamped-min"; requested: string }
  /** 요청월이 최신월 이후 — 최신월로 보정. */
  | { kind: "clamped-max"; requested: string }
  /** 구간 안이지만 그 달이 없음(결측) — 가장 가까운 이전 달로 보정. */
  | { kind: "nearest"; requested: string }
  /** 형식이 틀렸거나 값이 없음 — 기본값 사용. */
  | { kind: "invalid"; requested?: string };

export interface ResolvedMonth {
  point: Point;
  adjustment: MonthAdjustment;
}

/**
 * 요청월을 실제 데이터가 있는 월로 해석한다.
 * series는 날짜 오름차순이라고 가정한다(수집 스크립트가 보장).
 */
export function resolveMonth(
  series: Point[],
  requested: string | undefined,
  fallbackYm: string,
): ResolvedMonth {
  const first = series[0];
  const last = series[series.length - 1];

  if (!isValidYm(requested)) {
    // 기본값도 구간 밖일 수 있다(예: CNY에 10년 전). 같은 경로로 다시 태운다.
    const resolved = resolveMonth(series, fallbackYm, first.date);
    return {
      point: resolved.point,
      adjustment:
        resolved.adjustment.kind === "none"
          ? { kind: "invalid", requested: requested ?? undefined }
          : resolved.adjustment,
    };
  }

  if (requested < first.date) {
    return { point: first, adjustment: { kind: "clamped-min", requested } };
  }
  if (requested > last.date) {
    return { point: last, adjustment: { kind: "clamped-max", requested } };
  }

  const exact = series.find((p) => p.date === requested);
  if (exact) return { point: exact, adjustment: { kind: "none" } };

  // 결측월: 구간 안이므로 가장 가까운 이전 달이 반드시 존재한다.
  let nearest = first;
  for (const p of series) {
    if (p.date <= requested) nearest = p;
    else break;
  }
  return { point: nearest, adjustment: { kind: "nearest", requested } };
}

export interface CompareResult {
  from: Point;
  to: Point;
  /** 변화폭(원). r2 - r1. */
  diff: number;
  /** 변화율(%). (r2 - r1) / r1 × 100. */
  changePercent: number;
  /** 외화 고정 — 같은 외화 금액이 그때/지금 몇 원인가. */
  foreignFixed: {
    amount: number;
    thenKrw: number;
    nowKrw: number;
    diffKrw: number;
  };
  /** 원화 고정 — 같은 원화 금액이 그때/지금 몇 외화인가(=원화 구매력). */
  krwFixed: {
    amount: number;
    thenForeign: number;
    nowForeign: number;
    diffForeign: number;
    /**
     * 원화 구매력 변화율(%). (r1 / r2 - 1) × 100.
     * 🔴 변화율의 부호 반전이 아니다 — +34.70%의 반대는 -34.70%가 아니라 -25.76%다.
     */
    purchasingPowerPercent: number;
  };
}

export function compareRates(
  from: Point,
  to: Point,
  meta: CurrencyMeta,
  options: { foreignAmount?: number; krwAmount?: number } = {},
): CompareResult {
  const r1 = from.rate;
  const r2 = to.rate;
  const foreignAmount = options.foreignAmount ?? meta.defaultForeignAmount;
  const krwAmount = options.krwAmount ?? KRW_BASE_AMOUNT;

  // 외화 → 원화: rate는 `unit` 외화당 원이므로 amount/unit 배를 곱한다(JPY는 /100).
  const thenKrw = (foreignAmount / meta.unit) * r1;
  const nowKrw = (foreignAmount / meta.unit) * r2;
  // 원화 → 외화: 역방향도 같은 단위 보정을 거친다.
  const thenForeign = (krwAmount / r1) * meta.unit;
  const nowForeign = (krwAmount / r2) * meta.unit;

  return {
    from,
    to,
    diff: r2 - r1,
    changePercent: ((r2 - r1) / r1) * 100,
    foreignFixed: {
      amount: foreignAmount,
      thenKrw,
      nowKrw,
      diffKrw: nowKrw - thenKrw,
    },
    krwFixed: {
      amount: krwAmount,
      thenForeign,
      nowForeign,
      diffForeign: nowForeign - thenForeign,
      purchasingPowerPercent: (r1 / r2 - 1) * 100,
    },
  };
}

export interface PresetSpec {
  id: string;
  /** 화면 라벨 — "10년 전". */
  label: string;
  /** 왜 이 시점인지 한 줄. */
  note: string;
  /** 비교 시작월(요청값). resolveMonth를 통과시켜 쓴다. */
  fromYm: string;
}

/**
 * 고정 6블록 프리셋. 날짜는 전부 데이터에서 파생한다 — "5년 전"은 최신월에서 60개월 뺀 값이지
 * 상수가 아니다. (조합 URL을 양산하지 않기 위해 프리셋 수는 고정이다.)
 */
export function buildPresets(data: SeriesData): PresetSpec[] {
  const latestYm = data.latest.date;
  const covidLow = lowestOfYear(data.series, "2020");

  const presets: PresetSpec[] = [
    {
      id: "yoy",
      label: "전년 동월",
      note: "1년 사이 환율이 어디로 움직였는지.",
      fromYm: shiftMonths(latestYm, -12),
    },
    {
      id: "5y",
      label: "5년 전",
      note: "중기 흐름 — 환전·해외투자 계획의 기준선.",
      fromYm: shiftMonths(latestYm, -60),
    },
    {
      id: "10y",
      label: "10년 전",
      note: "장기 구매력 변화가 드러나는 구간.",
      fromYm: shiftMonths(latestYm, -120),
    },
    {
      id: "covid",
      label: "코로나 저점",
      note: "2020년 중 원화가 가장 강했던 달.",
      fromYm: covidLow ? covidLow.date : shiftMonths(latestYm, -60),
    },
    {
      id: "gfc",
      label: "금융위기",
      note: "2009년 3월 — 글로벌 금융위기로 원화가 급락한 시기.",
      fromYm: "2009-03",
    },
    {
      id: "peak",
      label: "역대 최고월",
      note: "시계열 전체에서 환율이 가장 높았던 달.",
      fromYm: data.stats.max.date,
    },
  ];

  return presets;
}

/** 해당 연도 중 환율이 가장 낮았던(=원화가 가장 강했던) 달. 데이터 없으면 null. */
export function lowestOfYear(series: Point[], year: string): Point | null {
  const inYear = series.filter((p) => p.date.startsWith(`${year}-`));
  if (inYear.length === 0) return null;
  return inYear.reduce((min, p) => (p.rate < min.rate ? p : min), inYear[0]);
}

export function parseCurrency(raw: string | string[] | undefined): CurrencyCode {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (CURRENCY_CODES as readonly string[]).includes(value ?? "")
    ? (value as CurrencyCode)
    : "usd";
}

export function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/** 기본 비교 구간 — 최신월과 그 10년 전 같은 달. */
export function defaultRange(data: SeriesData): { from: string; to: string } {
  return {
    from: shiftMonths(data.latest.date, -120),
    to: data.latest.date,
  };
}
