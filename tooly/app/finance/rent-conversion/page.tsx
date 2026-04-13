"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  calculateRentConversion,
  getLegalConversionRate,
} from "@/lib/calculators/rent-conversion";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";
import interestRates from "@/lib/data/interest-rates.json";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const LEGAL_RATE = getLegalConversionRate(interestRates.baseRate);

function RentConversionInner() {
  const searchParams = useSearchParams();

  const [deposit, setDeposit] = useState(() => {
    const v = searchParams.get("deposit");
    return v ? Number(v) : 100_000_000;
  });
  const [monthlyRent, setMonthlyRent] = useState(() => {
    const v = searchParams.get("rent");
    return v ? Number(v) : 500_000;
  });
  const [conversionRate, setConversionRate] = useState(() => {
    const v = searchParams.get("rate");
    return v ? Number(v) : LEGAL_RATE;
  });

  const result = useMemo(
    () =>
      calculateRentConversion({
        deposit,
        monthlyRent,
        conversionRate,
      }),
    [deposit, monthlyRent, conversionRate]
  );

  const calculator = getCalculator("rent-conversion");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              전월세 전환 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              보증금과 월세를 법정 전환율 기준으로 자유롭게 변환하세요.
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
                  조건 입력
                </h2>

                {/* 보증금 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>보증금</span>
                    <span className="tabular-nums text-primary">
                      {fmt(deposit)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) =>
                        setDeposit(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={1_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 월세 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>월세</span>
                    <span className="tabular-nums text-primary">
                      {fmt(monthlyRent)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) =>
                        setMonthlyRent(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={10_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 전환율 */}
                <div className="mb-1">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>전환율</span>
                    <span className="tabular-nums text-primary">
                      {conversionRate.toFixed(2)}%
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={conversionRate}
                      onChange={(e) =>
                        setConversionRate(
                          Math.min(20, Math.max(0.1, Number(e.target.value)))
                        )
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={0.1}
                      min={0.1}
                      max={20}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      %
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-xs text-text-secondary">
                    법정 전환율:{" "}
                    <span className="font-medium tabular-nums text-text-primary">
                      {LEGAL_RATE.toFixed(2)}%
                    </span>{" "}
                    (기준금리 {interestRates.baseRate}% + 2%,{" "}
                    {interestRates.updatedAt} 기준)
                  </p>
                  <button
                    onClick={() => setConversionRate(LEGAL_RATE)}
                    className="shrink-0 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary-light transition-colors"
                  >
                    법정 전환율로 초기화
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* 법정전환율 배지 */}
                {conversionRate === LEGAL_RATE && (
                  <div className="mb-4 rounded-lg bg-positive-light px-3 py-2 text-xs font-medium text-positive">
                    현재 법정 전환율 ({LEGAL_RATE.toFixed(2)}%)이 적용되고
                    있습니다.
                  </div>
                )}
                {conversionRate > LEGAL_RATE && (
                  <div className="mb-4 rounded-lg bg-negative-light px-3 py-2 text-xs font-medium text-negative">
                    현재 전환율이 법정 전환율({LEGAL_RATE.toFixed(2)}%)보다
                    높습니다. 임차인에게 불리할 수 있습니다.
                  </div>
                )}

                {/* Direction 1: 보증금 + 월세 → 전세 환산 */}
                <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                  <p className="text-xs font-medium text-text-secondary">
                    전세 환산 보증금 (보증금 + 월세 → 전세)
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                    {fmt(result.fullJeonse)}
                    <span className="ml-1 text-lg font-medium">원</span>
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    현재 보증금 {fmt(deposit)}원 + 월세분 환산{" "}
                    {fmt(result.fullJeonse - deposit)}원
                  </p>
                </div>

                {/* Direction 2: 보증금 → 월세 */}
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-xs font-medium text-text-secondary">
                    보증금 환산 월세 (보증금 → 월세)
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">
                    {fmt(result.monthlyFromDeposit)}
                    <span className="ml-1 text-base font-medium">원/월</span>
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    보증금 {fmt(deposit)}원을 전환율{" "}
                    {conversionRate.toFixed(2)}%로 환산한 월세입니다.
                  </p>
                </div>

                <div className="mt-4 rounded-lg bg-surface px-4 py-3 text-xs text-text-secondary">
                  <p>
                    <span className="font-medium text-text-primary">
                      적용 전환율:
                    </span>{" "}
                    {conversionRate.toFixed(2)}%
                  </p>
                  <p className="mt-1">
                    <span className="font-medium text-text-primary">
                      법정 전환율:
                    </span>{" "}
                    {LEGAL_RATE.toFixed(2)}% (기준금리{" "}
                    {interestRates.baseRate}% + 2%)
                  </p>
                </div>
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="전월세 전환율 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">법정 전환율이란?</strong>
                    <p className="mt-0.5">
                      주택임대차보호법에 따라 보증금의 일부를 월세로 전환하거나
                      반대로 전환할 때 적용되는 법적 상한 비율입니다. 현행
                      법정 전환율은 한국은행 기준금리에 대통령령으로 정한 이율
                      2%를 더한 값입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      전환율이 높으면?
                    </strong>
                    <p className="mt-0.5">
                      전환율이 높을수록 보증금 대비 월세가 높아집니다. 임대인
                      입장에서는 유리하지만 임차인의 부담이 커집니다. 법정
                      전환율을 초과하는 전환은 임차인이 초과분을 반환 청구할 수
                      있습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활용 방법</strong>
                    <p className="mt-0.5">
                      월세 계약을 전세 가치로 환산하거나, 전세 보증금이 부족할
                      때 월세 전환 금액을 산정하는 데 활용합니다. 전세와 월세
                      중 어느 쪽이 유리한지 비교할 때도 유용합니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="rent-conversion" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="전월세 전환 계산기 - Tooly"
                  description={`보증금 ${fmt(deposit)}원 / 월세 ${fmt(monthlyRent)}원 / 전환율 ${conversionRate.toFixed(2)}% → 전세 환산 ${fmt(result.fullJeonse)}원`}
                />
              </div>

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

export default function RentConversionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <RentConversionInner />
    </Suspense>
  );
}
