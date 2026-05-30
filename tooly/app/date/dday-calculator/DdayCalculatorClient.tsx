"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateDday } from "@/lib/calculators/dday";
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

function DdayCalculatorInner() {
  const searchParams = useSearchParams();

  const [targetDate, setTargetDate] = useState(() => {
    return searchParams.get("date") ?? "";
  });
  const [eventName, setEventName] = useState(() => {
    return searchParams.get("name") ?? "";
  });

  const result = targetDate ? calculateDday(targetDate) : null;

  const ddayLabel = (() => {
    if (!result) return null;
    if (result.daysRemaining === 0) return "D-Day";
    if (result.daysRemaining > 0) return `D-${result.daysRemaining}`;
    return `D+${Math.abs(result.daysRemaining)}`;
  })();

  const calculator = getCalculator("dday-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              D-Day 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              목표 날짜까지 남은 일수를 계산합니다. 시험, 기념일, 출산 예정일 등
              중요한 날을 D-Day로 확인하세요.
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

                {/* Event name */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    이벤트 이름{" "}
                    <span className="font-normal text-text-secondary">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={eventName}
                    placeholder="예: 수능, 결혼기념일, 졸업식"
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    maxLength={50}
                  />
                </div>

                {/* Target date */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    목표 날짜
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">
                    오늘: {todayString()}
                  </p>
                </div>
              </div>

              {/* Quick preset buttons */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-text-primary">
                  빠른 설정
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "100일 후", days: 100 },
                    { label: "1년 후", days: 365 },
                    { label: "50일 후", days: 50 },
                    { label: "30일 후", days: 30 },
                    { label: "7일 후", days: 7 },
                  ].map(({ label, days }) => (
                    <button
                      key={label}
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + days);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, "0");
                        const day = String(d.getDate()).padStart(2, "0");
                        setTargetDate(`${y}-${m}-${day}`);
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="D-Day 개념 설명">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">D-Day란?</strong>
                    <p className="mt-0.5">
                      D-Day는 중요한 날을 기준으로 날짜를 세는 방법입니다. 원래
                      군사 용어로 작전 개시일을 뜻했으나, 현재는 목표일·기념일 등을
                      세는 일상적 표현으로 사용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">D-숫자 표기</strong>
                    <p className="mt-0.5">
                      목표 날짜가 <span className="font-semibold">미래</span>이면
                      D-100 (100일 남음), 목표 날짜가{" "}
                      <span className="font-semibold">과거</span>이면 D+45 (45일
                      지남), 오늘이면 D-Day로 표기합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활용 예시</strong>
                    <p className="mt-0.5">
                      수능·공무원 시험 D-Day 카운트다운, 결혼기념일·생일 등 기념일
                      관리, 출산 예정일 확인, 프로젝트 마감일 관리 등에 활용할 수
                      있습니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="dday-calculator" />
            </div>

            {/* ── Right: Result sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* D-Day display */}
              <div
                className={`rounded-xl border p-5 ${
                  !result
                    ? "border-border bg-background"
                    : result.daysRemaining === 0
                    ? "border-primary bg-primary-light"
                    : result.daysRemaining > 0
                    ? "border-primary bg-primary-light"
                    : "border-border bg-surface"
                }`}
              >
                {!result ? (
                  <div className="py-4 text-center text-text-secondary">
                    <p className="text-sm">목표 날짜를 입력하세요</p>
                  </div>
                ) : (
                  <>
                    {eventName && (
                      <p className="mb-1 text-xs font-medium text-text-secondary">
                        {eventName}
                      </p>
                    )}
                    <p
                      className={`text-4xl font-bold tabular-nums ${
                        result.daysRemaining === 0
                          ? "text-primary"
                          : result.daysRemaining > 0
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {ddayLabel}
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {result.daysRemaining === 0
                        ? "오늘이 바로 그 날입니다!"
                        : result.daysRemaining > 0
                        ? `${result.daysRemaining}일 남았습니다`
                        : `${Math.abs(result.daysRemaining)}일 지났습니다`}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                      <div>
                        <p className="text-xs text-text-secondary">남은 주</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.weeksRemaining}주{" "}
                          <span className="font-normal text-text-secondary">
                            {Math.abs(result.daysRemaining) % 7}일
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">목표 날짜</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {targetDate}
                        </p>
                      </div>
                    </div>

                    {result.daysRemaining > 0 && (
                      <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                        {Math.floor(result.daysRemaining / 30)}개월{" "}
                        {result.daysRemaining % 30}일 남음 (근사값)
                      </div>
                    )}
                    {result.daysRemaining < 0 && (
                      <div className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-text-secondary">
                        목표일로부터{" "}
                        {Math.floor(Math.abs(result.daysRemaining) / 30)}개월{" "}
                        {Math.abs(result.daysRemaining) % 30}일 경과 (근사값)
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="D-Day 계산기 - Tooly"
                  description={
                    result && ddayLabel
                      ? `${eventName ? eventName + " " : ""}${ddayLabel} (${targetDate})`
                      : "D-Day 계산기"
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

export default function DdayCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <DdayCalculatorInner />
    </Suspense>
  );
}
