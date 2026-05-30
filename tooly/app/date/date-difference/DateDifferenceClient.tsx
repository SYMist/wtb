"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateDateDifference } from "@/lib/calculators/date-difference";
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

function DateDifferenceInner() {
  const searchParams = useSearchParams();

  const today = todayString();

  const [startDate, setStartDate] = useState(() => {
    return searchParams.get("start") ?? today;
  });
  const [endDate, setEndDate] = useState(() => {
    return searchParams.get("end") ?? today;
  });

  const canCalculate = startDate && endDate;
  const result = canCalculate ? calculateDateDifference(startDate, endDate) : null;

  const calculator = getCalculator("date-difference");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              날짜 차이 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다. 윤년을 반영한
              정확한 기간을 확인하세요.
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
                  날짜 입력
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Start date */}
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

                  {/* End date */}
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

                {/* Swap button */}
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

              {/* Result breakdown cards */}
              {result && (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    기간 상세
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">총 일수</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                        {result.totalDays.toLocaleString("ko-KR")}
                      </p>
                      <p className="text-xs text-text-secondary">일</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">주 + 일</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.weeks}
                      </p>
                      <p className="text-xs text-text-secondary">
                        주 {result.remainderDays}일
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">개월</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.months}
                      </p>
                      <p className="text-xs text-text-secondary">개월</p>
                    </div>
                    <div className="rounded-lg bg-surface p-3 text-center">
                      <p className="text-xs text-text-secondary">연도</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                        {result.years}
                      </p>
                      <p className="text-xs text-text-secondary">년</p>
                    </div>
                  </div>

                  {/* Detailed list */}
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">총 일수</span>
                      <span className="tabular-nums text-sm font-semibold text-text-primary">
                        {result.totalDays.toLocaleString("ko-KR")}일
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">주 단위</span>
                      <span className="tabular-nums text-sm font-semibold text-text-primary">
                        {result.weeks}주 {result.remainderDays}일
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">월 단위</span>
                      <span className="tabular-nums text-sm font-semibold text-text-primary">
                        약 {result.months}개월
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">년 단위</span>
                      <span className="tabular-nums text-sm font-semibold text-text-primary">
                        약 {result.years}년 {result.months % 12}개월
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="날짜 차이 계산 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">윤년 반영</strong>
                    <p className="mt-0.5">
                      이 계산기는 윤년(2월 29일)을 포함하여 정확한 일수를
                      계산합니다. 4년에 한 번 돌아오는 윤년은 365일이 아닌
                      366일로 계산됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">월·년 계산 기준</strong>
                    <p className="mt-0.5">
                      개월 수는 실제 달력 기준으로 계산합니다. 예를 들어 1월
                      31일~2월 28일은 1개월이며, 일수 기준 단순 나눗셈과는
                      다를 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활용 예시</strong>
                    <p className="mt-0.5">
                      계약 기간 확인, 사귄 날짜·결혼 날짜 계산, 프로젝트 기간
                      산출, 연차 계산 등 다양한 용도로 활용할 수 있습니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="date-difference" />
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
                <p className="text-xs font-medium text-text-secondary">총 일수</p>
                {result ? (
                  <>
                    <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                      {result.totalDays.toLocaleString("ko-KR")}
                      <span className="ml-1 text-xl font-medium">일</span>
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                      <div>
                        <p className="text-xs text-text-secondary">시작일</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {startDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">종료일</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {endDate}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    두 날짜를 입력하세요
                  </p>
                )}
              </div>

              {/* Summary breakdown */}
              {result && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="mb-3 text-sm font-semibold text-text-primary">
                    기간 요약
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">주 단위</span>
                      <span className="tabular-nums font-medium text-text-primary">
                        {result.weeks}주 {result.remainderDays}일
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">월 단위</span>
                      <span className="tabular-nums font-medium text-text-primary">
                        약 {result.months}개월
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">년 단위</span>
                      <span className="tabular-nums font-medium text-text-primary">
                        약 {result.years}년 {result.months % 12}개월
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="날짜 차이 계산기 - Tooly"
                  description={
                    result
                      ? `${startDate} ~ ${endDate}: 총 ${result.totalDays.toLocaleString("ko-KR")}일 (${result.weeks}주 ${result.remainderDays}일)`
                      : "날짜 차이 계산기"
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

export default function DateDifferencePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <DateDifferenceInner />
    </Suspense>
  );
}
