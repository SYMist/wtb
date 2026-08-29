/**
 * 소비자물가지수(CPI) 원지수 기반 화폐가치 환산.
 *
 * 🔴 기준연도 급소: 원지수(cpi-index-series.json)는 UNIT_NAME(예: "2020=100")이
 * 바뀌는 지수 개편을 겪는다(2026-12-18 예정). 환산 비율은 두 시점의 지수값 비(比)만
 * 쓰므로 개편 전후를 같은 baseYear 안에서 비교하는 한 문제없지만, series.ts의
 * baseYear 가드가 개편 시 전량 재적재하므로 옛 기준의 시점은 새 파일에 없을 수 있다
 * (호출부에서 resolveMonth로 클램프된 시점임을 화면에 표시해야 한다).
 *
 * 통화 비교(exchange-compare.ts)와 형태가 같아 시점 무관 유틸(isValidYm·shiftMonths·
 * resolveMonth·firstParam·josa)은 그대로 재사용한다 — 화폐가치 환산 전용 로직만 추가.
 */

import {
  isValidYm,
  shiftMonths,
  resolveMonth,
  firstParam,
  josa,
  type Point,
  type SeriesData,
  type MonthAdjustment,
  type ResolvedMonth,
} from "./exchange-compare";

export { isValidYm, shiftMonths, resolveMonth, firstParam, josa };
export type { Point, SeriesData, MonthAdjustment, ResolvedMonth };

/** 화폐가치 환산의 기준 금액(100만원). */
export const KRW_BASE_AMOUNT = 1_000_000;

export interface MoneyValueResult {
  /** 과거 시점 원지수 포인트. */
  from: Point;
  /** 현재 시점(보통 latest) 원지수 포인트. */
  to: Point;
  /** to.rate / from.rate — 지수 배율. */
  ratio: number;
  /** 배율을 %로 — 이 구간 누적 물가 상승률. */
  changePercent: number;
  amount: number;
  /** 그때 amount원이 지금 가치로 얼마인지. */
  thenAmountNowValue: number;
  /** 지금 amount원이 그때 가치로 얼마인지(구매력 역산). */
  nowAmountThenValue: number;
}

export function compareMoneyValue(
  from: Point,
  to: Point,
  amount: number = KRW_BASE_AMOUNT,
): MoneyValueResult {
  const ratio = to.rate / from.rate;
  return {
    from,
    to,
    ratio,
    changePercent: (ratio - 1) * 100,
    amount,
    thenAmountNowValue: amount * ratio,
    nowAmountThenValue: amount / ratio,
  };
}

export interface MoneyPresetSpec {
  id: string;
  /** 화면 라벨 — "1990년". */
  label: string;
  /** 왜 이 시점인지 한 줄. */
  note: string;
  /** 비교 시작월(요청값). resolveMonth를 통과시켜 쓴다. */
  fromYm: string;
}

/**
 * 고정 4블록 프리셋. 날짜는 최신월 기준 파생값을 포함해 전부 데이터에서 나온다.
 * (조합 URL을 양산하지 않기 위해 프리셋 수는 고정이다.)
 */
export function buildMoneyPresets(indexData: SeriesData): MoneyPresetSpec[] {
  const latestYm = indexData.latest.date;
  const seriesStart = indexData.series[0].date;

  return [
    {
      id: "start",
      label: `${seriesStart.slice(0, 4)}년(통계 시작)`,
      note: "소비자물가지수 통계 작성 이래 전체 기간의 물가 변화.",
      fromYm: seriesStart,
    },
    {
      id: "1990",
      label: "1990년",
      note: "3저 호황 이후 — 자산가격 상승기 진입 전.",
      fromYm: "1990-01",
    },
    {
      id: "2000",
      label: "2000년",
      note: "외환위기 이후 물가 안정기 진입 시점.",
      fromYm: "2000-01",
    },
    {
      id: "10y",
      label: "10년 전",
      note: "최근 10년간의 물가 변화.",
      fromYm: shiftMonths(latestYm, -120),
    },
  ];
}
