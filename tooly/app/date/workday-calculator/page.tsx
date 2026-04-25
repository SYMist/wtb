"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateWorkdays, HOLIDAYS_2026 } from "@/lib/calculators/workday";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const HOLIDAY_NAMES: Record<string, string> = {
  "2026-01-01": "신정",
  "2026-02-16": "설날 전날",
  "2026-02-17": "설날",
  "2026-02-18": "설날 다음날",
  "2026-03-01": "삼일절",
  "2026-05-05": "어린이날",
  "2026-05-24": "석가탄신일",
  "2026-06-06": "현충일",
  "2026-08-15": "광복절",
  "2026-09-24": "추석 전날",
  "2026-09-25": "추석",
  "2026-09-26": "추석 다음날",
  "2026-10-03": "개천절",
  "2026-10-09": "한글날",
  "2026-12-25": "크리스마스",
};

function WorkdayCalculatorInner() {
  const searchParams = useSearchParams();
  const today = todayString();

  const [startDate, setStartDate] = useState(() => {
    return searchParams.get("start") ?? today;
  });
  const [endDate, setEndDate] = useState(() => {
    return searchParams.get("end") ?? today;
  });

  const canCalculate = startDate && endDate;
  const result = canCalculate ? calculateWorkdays(startDate, endDate) : null;

  // Find which 2026 holidays fall within the date range
  const holidaysInRange = useMemo(() => {
    if (!canCalculate) return [];
    const start = new Date(startDate < endDate ? startDate : endDate);
    const end = new Date(startDate < endDate ? endDate : startDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return HOLIDAYS_2026.filter((h) => {
      const d = new Date(h);
      return d >= start && d <= end;
    });
  }, [startDate, endDate, canCalculate]);

  const calculator = getCalculator("workday-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              근무일수 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              두 날짜 사이의 근무일수를 주말과 공휴일을 제외하여 계산합니다.
              2026년 대한민국 법정 공휴일이 반영됩니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs + Guide ── */}
            <div className="flex-1 space-y-6">
              {/* Input card */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  기간 입력
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    const tmp = startDate;
                    setStartDate(endDate);
                    setEndDate(tmp);
                  }}
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  시작일 ↔ 종료일 교체
                </button>
              </div>

              {/* Result breakdown */}
              {result && (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    기간 상세
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-primary-light p-3 text-center">
                      <p className="text-xs text-text-secondary">근무일수</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                        {result.workdays}
                      </p>
                      <p className="text-xs text-text-secondary">일</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">총 일수</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.totalDays}
                      </p>
                      <p className="text-xs text-text-secondary">일</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">주말</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.weekends}
                      </p>
                      <p className="text-xs text-text-secondary">일</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">공휴일</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.holidays}
                      </p>
                      <p className="text-xs text-text-secondary">일</p>
                    </div>
                  </div>

                  {/* Detailed breakdown */}
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">총 일수</span>
                      <span className="tabular-nums text-sm font-semibold text-text-primary">
                        {result.totalDays}일
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">주말 (토·일)</span>
                      <span className="tabular-nums text-sm font-semibold text-text-secondary">
                        -{result.weekends}일
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">공휴일 (평일)</span>
                      <span className="tabular-nums text-sm font-semibold text-text-secondary">
                        -{result.holidays}일
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-primary-light px-4 py-3">
                      <span className="text-sm font-semibold text-primary">
                        근무일수
                      </span>
                      <span className="tabular-nums text-sm font-bold text-primary">
                        {result.workdays}일
                      </span>
                    </div>
                  </div>

                  {/* Holidays in range */}
                  {holidaysInRange.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-medium text-text-secondary">
                        해당 기간 내 공휴일 ({holidaysInRange.length}일)
                      </p>
                      <div className="space-y-1">
                        {holidaysInRange.map((h) => (
                          <div
                            key={h}
                            className="flex items-center justify-between rounded-md bg-surface px-3 py-1.5 text-xs"
                          >
                            <span className="tabular-nums text-text-secondary">
                              {h}
                            </span>
                            <span className="font-medium text-text-primary">
                              {HOLIDAY_NAMES[h] ?? "공휴일"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing holiday data warning */}
                  {result.missingHolidayYears.length > 0 && (
                    <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <strong className="font-semibold">알림:</strong>{" "}
                      {result.missingHolidayYears.join(", ")}년 공휴일 데이터가
                      아직 등록되지 않아 해당 연도의 공휴일은 0으로 집계됩니다.
                      주말/총일수 계산은 정확합니다.
                    </div>
                  )}
                </div>
              )}

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="근무일수 계산 안내 및 2026년 공휴일">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">계산 방법</strong>
                    <p className="mt-0.5">
                      총 일수에서 주말(토요일·일요일)과 평일 공휴일을 제외한
                      날짜가 근무일수입니다. 주말과 겹치는 공휴일은 이미 주말로
                      제외되므로 중복 제외하지 않습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">2026년 대한민국 법정 공휴일</strong>
                    <div className="mt-1 space-y-1">
                      {HOLIDAYS_2026.map((h) => (
                        <div
                          key={h}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="tabular-nums text-text-secondary">{h}</span>
                          <span className="text-text-primary">
                            {HOLIDAY_NAMES[h] ?? "공휴일"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong className="text-text-primary">주의사항</strong>
                    <p className="mt-0.5">
                      임시 공휴일, 회사별 창립기념일 등은 반영되지 않습니다.
                      또한 2026년 이외의 연도는 공휴일이 반영되지 않아 주말만
                      제외됩니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="workday-calculator" />
            </div>

            {/* ── Right: Result sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Main result card */}
              <div
                className={`rounded-xl border p-5 ${
                  result
                    ? "border-primary bg-primary-light"
                    : "border-border bg-background"
                }`}
              >
                <p className="text-xs font-medium text-text-secondary">근무일수</p>
                {result ? (
                  <>
                    <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                      {result.workdays}
                      <span className="ml-1 text-xl font-medium">일</span>
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2 border-t border-primary/20 pt-3">
                      <div className="text-center">
                        <p className="text-xs text-text-secondary">총 일수</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.totalDays}일
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-text-secondary">주말</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.weekends}일
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-text-secondary">공휴일</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.holidays}일
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    날짜를 입력하세요
                  </p>
                )}
              </div>

              {/* Quick period presets */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  빠른 기간 설정
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "이번 달", getDates: () => {
                      const now = new Date();
                      const y = now.getFullYear();
                      const m = now.getMonth();
                      const first = `${y}-${String(m + 1).padStart(2, "0")}-01`;
                      const last = new Date(y, m + 1, 0);
                      const lastStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;
                      return [first, lastStr] as [string, string];
                    }},
                    { label: "이번 주 (월~금)", getDates: () => {
                      const now = new Date();
                      const day = now.getDay();
                      const mon = new Date(now);
                      mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
                      const fri = new Date(mon);
                      fri.setDate(mon.getDate() + 4);
                      const fmt2 = (d: Date) => {
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      };
                      return [fmt2(mon), fmt2(fri)] as [string, string];
                    }},
                  ].map(({ label, getDates }) => (
                    <button
                      key={label}
                      onClick={() => {
                        const [s, e] = getDates();
                        setStartDate(s);
                        setEndDate(e);
                      }}
                      className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="근무일수 계산기 - Tooly"
                  description={
                    result
                      ? `${startDate} ~ ${endDate}: 총 ${result.totalDays}일 중 근무일 ${result.workdays}일 (주말 ${result.weekends}일, 공휴일 ${result.holidays}일 제외)`
                      : "근무일수 계산기"
                  }
                />
              </div>

              {/* Sidebar ad */}
              <AdSlot type="sidebar" />
            </aside>
          </div>

          {/* Bottom banner ad */}
          <div className="mt-8">
            <AdSlot type="banner" />
          </div>
        </div>
      </main>

      <Footer />

      {calculator && <JsonLd calculator={calculator} />}
    </>
  );
}

export default function WorkdayCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <WorkdayCalculatorInner />
    </Suspense>
  );
}
