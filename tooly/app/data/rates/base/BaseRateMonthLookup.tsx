"use client";

import { useSyncExternalStore } from "react";
import {
  firstParam,
  resolveBaseRateMonth,
  type Point,
} from "@/lib/data/base-rate-month";
import TrackedUserActionForm from "../../_components/TrackedUserActionForm";

const PATH = "/data/rates/base";

interface BaseRateMonthLookupProps {
  series: Point[];
  latest: Point;
  checkedAt?: string;
}

function formatYM(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

function subscribeToLocation(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  // 정적 HTML은 선택 전 상태로 수화한다. 구독 직후 한 번 다시 읽어 URL의 month를
  // 반영하고, 뒤로·앞으로 이동은 popstate로 이어서 반영한다.
  queueMicrotask(onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function readRequestedMonth() {
  const params = new URLSearchParams(window.location.search);
  return firstParam(params.getAll("month"));
}

// 서버와 첫 수화는 모두 선택 전 상태로 시작해 정적 HTML을 유지한다.
function emptyRequestedMonth() {
  return undefined;
}

/**
 * 과거 월 조회는 정적 시계열 페이지의 작은 클라이언트 기능으로 남긴다.
 *
 * searchParams를 서버에서 읽으면 핵심 검색 랜딩 전체가 동적 렌더가 된다. GET 이동 뒤
 * 브라우저 URL에서만 month를 읽으면 공유 가능한 URL은 유지하면서 정적 본문·캐시도 지킨다.
 */
export default function BaseRateMonthLookup({
  series,
  latest,
  checkedAt,
}: BaseRateMonthLookupProps) {
  // 기본 렌더는 이벤트도 결과도 만들지 않는다. 폼 GET 이동 뒤의 URL만 해석한다.
  const requestedMonth = useSyncExternalStore(
    subscribeToLocation,
    readRequestedMonth,
    emptyRequestedMonth,
  );

  const monthLookup = resolveBaseRateMonth(series, requestedMonth);
  const selectedMonth = monthLookup.kind === "found" ? monthLookup.point : null;
  const currentDifference = selectedMonth ? latest.rate - selectedMonth.rate : 0;

  const monthLookupNotice = (() => {
    switch (monthLookup.kind) {
      case "invalid":
        return `입력한 ${monthLookup.requested}을 연·월로 읽을 수 없습니다. YYYY-MM 형식으로 입력하세요.`;
      case "before-range":
        return `입력한 ${formatYM(monthLookup.requested)}은 수록 시작(${formatYM(series[0].date)}) 이전입니다. 다른 달을 대신 표시하지 않았습니다.`;
      case "after-range":
        return `입력한 ${formatYM(monthLookup.requested)}은 최신 수록월(${formatYM(latest.date)}) 이후입니다. 다른 달을 대신 표시하지 않았습니다.`;
      case "missing":
        return `입력한 ${formatYM(monthLookup.requested)}의 월말 기준금리 데이터가 없습니다. 다른 달을 대신 표시하지 않았습니다.`;
      default:
        return null;
    }
  })();

  return (
    <section
      id="month-lookup"
      className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6"
    >
      <h2 className="mb-1 text-lg font-semibold text-text-primary">
        과거 월 기준금리 바로 찾기
      </h2>
      <p className="mb-4 text-sm text-text-secondary">
        찾는 연·월을 고르면 그달 말에 유효했던 한국은행 기준금리와 현재값 차이를 확인합니다.
      </p>

      <TrackedUserActionForm
        key={requestedMonth ?? "default"}
        action={`${PATH}#month-lookup`}
        className="grid gap-3 sm:max-w-md sm:grid-cols-[1fr_auto]"
        eventName="base_month_lookup_submit"
        eventParams={{ page: "rates_base", action_origin: "month_lookup" }}
      >
        <label className="text-xs text-text-secondary">
          기준월
          <input
            type="month"
            name="month"
            defaultValue={selectedMonth?.date ?? latest.date}
            min={series[0].date}
            max={latest.date}
            required
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
          />
        </label>
        <button
          type="submit"
          className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          조회하기
        </button>
      </TrackedUserActionForm>

      <p className="mt-3 text-[11px] text-text-secondary">
        선택 가능한 구간은 {formatYM(series[0].date)}부터 {formatYM(latest.date)}까지입니다. 월말 기준이며, 기준금리는 개인의 실제 대출·예금 금리에 그대로 적용되지 않습니다.
      </p>

      {monthLookupNotice && (
        <p className="mt-4 rounded-md border border-amber-400/50 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          ⚠ {monthLookupNotice}
        </p>
      )}

      {selectedMonth && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-text-secondary">선택월</p>
              <p className="mt-1 text-xl font-bold text-text-primary">
                {selectedMonth.rate.toFixed(2)}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(selectedMonth.date)} 월말
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">현재</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {latest.rate.toFixed(2)}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(latest.date)} 월말
              </p>
            </div>
            <div>
              <p className="text-xs text-text-secondary">현재와 차이</p>
              <p className="mt-1 text-xl font-bold text-text-primary">
                {currentDifference === 0
                  ? "같음"
                  : `${currentDifference > 0 ? "+" : ""}${currentDifference.toFixed(2)}%p`}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {currentDifference === 0
                  ? "선택월과 현재가 같습니다."
                  : `현재가 선택월보다 ${Math.abs(currentDifference).toFixed(2)}%p ${currentDifference > 0 ? "높습니다." : "낮습니다."}`}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">
            출처: 한국은행 ECOS · 데이터 기준 {formatYM(latest.date)}
            {checkedAt && ` · 원천 확인 ${checkedAt}`}. 이 값은 월말의 정책 기준금리이며, 은행 상품·신용 조건에 따른 실제 적용금리는 다를 수 있습니다.
          </p>
        </div>
      )}
    </section>
  );
}
