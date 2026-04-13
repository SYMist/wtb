"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { calculateSeverance } from "@/lib/calculators/severance";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function SeveranceCalculatorInner() {
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(() => {
    return searchParams.get("start") || "2020-01-01";
  });
  const [endDate, setEndDate] = useState(() => {
    return searchParams.get("end") || "2026-04-13";
  });
  const [monthlyPay, setMonthlyPay] = useState(() => {
    const v = searchParams.get("pay");
    return v ? Number(v) : 3_000_000;
  });

  const result = useMemo(() => {
    // Guard: end must be after start
    if (new Date(endDate) <= new Date(startDate)) return null;
    return calculateSeverance({
      startDate,
      endDate,
      recentMonthlyPay: monthlyPay,
    });
  }, [startDate, endDate, monthlyPay]);

  const isEligible = result !== null && result.totalDays >= 365;

  const calculator = getCalculator("severance-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              퇴직금 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              입사일과 퇴사일, 월평균 급여를 입력하면 예상 퇴직금을 즉시
              계산합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left: Main content */}
            <div className="flex-1 space-y-6">
              {/* Inputs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  근무 정보 입력
                </h2>

                {/* 입사일 */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    입사일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                {/* 퇴사일 */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    퇴사일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                {/* 월평균급여 */}
                <div className="mb-0">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>최근 3개월 월평균 급여</span>
                    <span className="tabular-nums text-primary">
                      {fmt(monthlyPay)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={monthlyPay}
                      onChange={(e) =>
                        setMonthlyPay(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={100_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    기본급, 고정 수당 등 정기적으로 지급된 금액의 평균을
                    입력하세요.
                  </p>
                </div>
              </div>

              {/* Results */}
              {result === null ? (
                <div className="rounded-xl border border-border bg-surface p-5 text-center text-sm text-text-secondary">
                  퇴사일이 입사일보다 이후여야 합니다.
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    계산 결과
                  </h2>

                  {/* Eligibility notice */}
                  {!isEligible ? (
                    <div className="mb-4 rounded-lg bg-negative-light px-4 py-3 text-sm text-negative">
                      퇴직금은 계속 근로기간이 1년(365일) 이상인 경우에만
                      지급됩니다. 현재 근속기간은{" "}
                      <span className="font-semibold tabular-nums">
                        {result.totalDays}일
                      </span>
                      입니다.
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg bg-positive-light px-4 py-3 text-sm text-positive">
                      퇴직금 수급 요건을 충족합니다.
                    </div>
                  )}

                  {/* 퇴직금 총액 highlight */}
                  <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                    <p className="text-xs font-medium text-text-secondary">
                      퇴직금 총액
                    </p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {fmt(result.severancePay)}
                      <span className="ml-1 text-lg font-medium">원</span>
                    </p>
                    {!isEligible && (
                      <p className="mt-1 text-xs text-text-secondary">
                        1년 미만 근무로 실제 지급 대상이 아닙니다.
                      </p>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">근속기간</p>
                      <p className="mt-1 text-base font-semibold text-text-primary">
                        {result.years > 0 && (
                          <span className="tabular-nums">{result.years}년 </span>
                        )}
                        {result.months > 0 && (
                          <span className="tabular-nums">
                            {result.months}개월{" "}
                          </span>
                        )}
                        <span className="tabular-nums">{result.days}일</span>
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-text-secondary">
                        (총 {result.totalDays.toLocaleString("ko-KR")}일)
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">1일 평균임금</p>
                      <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                        {fmt(result.dailyWage)}원
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        월급 × 3 ÷ 91일
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">계산식</p>
                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        1일 평균임금 × 30일 × (근속일수 ÷ 365)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="퇴직금 계산 공식 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">퇴직금 계산 공식</strong>
                    <p className="mt-0.5">
                      퇴직금 = 1일 평균임금 × 30일 × (계속 근로기간 ÷ 365)
                      <br />
                      1일 평균임금 = 최근 3개월 급여 총액 ÷ 해당 일수(약 91일)
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">수급 요건</strong>
                    <p className="mt-0.5">
                      계속 근로기간이 1년 이상이고 주 소정 근로시간이 15시간
                      이상인 근로자에게 퇴직 시 지급합니다. 근로자퇴직급여
                      보장법에 따라 사용자는 의무적으로 퇴직금을 지급해야
                      합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">평균임금에 포함되는 항목</strong>
                    <p className="mt-0.5">
                      기본급, 각종 고정 수당(직책수당, 직무수당 등), 식대
                      (비과세 한도 초과분), 상여금(최근 3개월분), 연차수당
                      등이 포함됩니다. 실비변상 성격의 금품은 제외됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">세금</strong>
                    <p className="mt-0.5">
                      퇴직금은 퇴직소득세 과세 대상입니다. 근속연수 공제, 환산
                      급여 공제 등이 적용되어 일반 근로소득보다 세율이 낮습니다.
                      실수령액은 퇴직소득세를 별도로 계산해야 합니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="severance-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {result && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-text-secondary">
                    결과 공유하기
                  </p>
                  <ShareButton
                    title="퇴직금 계산기 - Tooly"
                    description={`근속 ${result.years}년 ${result.months}개월 / 월평균 ${fmt(monthlyPay)}원 → 퇴직금 ${fmt(result.severancePay)}원`}
                  />
                </div>
              )}

              <AdSlot type="sidebar" />
            </aside>
          </div>

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

export default function SeveranceCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <SeveranceCalculatorInner />
    </Suspense>
  );
}
