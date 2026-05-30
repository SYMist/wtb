"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { calculateCapitalGainsTax } from "@/lib/calculators/capital-gains-tax";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function CapitalGainsTaxInner() {
  const searchParams = useSearchParams();

  const [acquisitionPrice, setAcquisitionPrice] = useState(() => {
    const v = searchParams.get("acq");
    return v ? Number(v) : 500_000_000;
  });
  const [sellingPrice, setSellingPrice] = useState(() => {
    const v = searchParams.get("sell");
    return v ? Number(v) : 800_000_000;
  });
  const [holdingYears, setHoldingYears] = useState(() => {
    const v = searchParams.get("years");
    return v ? Number(v) : 5;
  });
  const [isSingleHome, setIsSingleHome] = useState(() => {
    return searchParams.get("single") === "true";
  });
  const [expenses, setExpenses] = useState(() => {
    const v = searchParams.get("exp");
    return v ? Number(v) : 0;
  });

  const result = useMemo(
    () =>
      calculateCapitalGainsTax({
        acquisitionPrice,
        sellingPrice,
        holdingYears,
        isSingleHome,
        expenses,
      }),
    [acquisitionPrice, sellingPrice, holdingYears, isSingleHome, expenses]
  );

  const isExempt =
    isSingleHome && holdingYears >= 2 && sellingPrice <= 1_200_000_000;

  const calculator = getCalculator("capital-gains-tax");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              양도소득세 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              부동산 양도차익과 장기보유 특별공제를 반영한 양도소득세를
              자동으로 계산합니다.
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

                {/* 1세대1주택 toggle */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    1세대 1주택 여부
                  </label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setIsSingleHome(true)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        isSingleHome
                          ? "bg-primary text-white"
                          : "bg-background text-text-secondary hover:bg-surface"
                      }`}
                    >
                      1세대 1주택
                    </button>
                    <button
                      onClick={() => setIsSingleHome(false)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        !isSingleHome
                          ? "bg-primary text-white"
                          : "bg-background text-text-secondary hover:bg-surface"
                      }`}
                    >
                      해당 없음
                    </button>
                  </div>
                  {isSingleHome && (
                    <p className="mt-1.5 text-xs text-text-secondary">
                      1세대 1주택: 2년 이상 보유 + 양도가액 12억 이하 시
                      비과세 적용
                    </p>
                  )}
                </div>

                {/* 취득가액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>취득가액</span>
                    <span className="tabular-nums text-primary">
                      {fmt(acquisitionPrice)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={acquisitionPrice}
                      onChange={(e) =>
                        setAcquisitionPrice(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={10_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 양도가액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>양도가액</span>
                    <span className="tabular-nums text-primary">
                      {fmt(sellingPrice)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) =>
                        setSellingPrice(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={10_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 필요경비 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>
                      필요경비{" "}
                      <span className="font-normal text-text-secondary">
                        (취득세, 중개수수료 등)
                      </span>
                    </span>
                    <span className="tabular-nums text-primary">
                      {fmt(expenses)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) =>
                        setExpenses(Math.max(0, Number(e.target.value)))
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

                {/* 보유기간 */}
                <div className="mb-0">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>보유기간</span>
                    <span className="tabular-nums text-primary">
                      {holdingYears}년
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={holdingYears}
                    onChange={(e) => setHoldingYears(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-secondary">
                    <span>0년</span>
                    <span>30년</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 10, 15, 20].map((y) => (
                      <button
                        key={y}
                        onClick={() => setHoldingYears(y)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          holdingYears === y
                            ? "border-primary bg-primary text-white"
                            : "border-border text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* 비과세 notice */}
                {isExempt ? (
                  <div className="mb-4 rounded-xl border border-positive bg-positive-light p-5 text-center">
                    <p className="text-lg font-bold text-positive">
                      비과세 대상
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      1세대 1주택 + 보유기간 2년 이상 + 양도가액 12억 이하로
                      양도소득세가 면제됩니다.
                    </p>
                    <div className="mt-3 rounded-lg bg-background px-4 py-3">
                      <p className="text-xs text-text-secondary">세후 순수익</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-positive">
                        {fmt(result.gain)}원
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 총 세금 highlight */}
                    <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-text-secondary">
                            총 세금 (양도소득세 + 지방소득세)
                          </p>
                          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                            {fmt(result.totalTax)}
                            <span className="ml-1 text-lg font-medium">원</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-text-secondary">
                            세후 순수익
                          </p>
                          <p className="mt-1 text-xl font-bold tabular-nums text-positive">
                            {fmt(result.netProfit)}원
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          양도차익
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {fmt(result.gain)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          장기보유 특별공제
                          {result.longTermDeductionRate > 0 && (
                            <span className="ml-1 text-xs text-primary">
                              ({result.longTermDeductionRate.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.longTermDeductionRate > 0
                            ? `- ${fmt(result.longTermDeduction)}원`
                            : "해당 없음 (3년 미만)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          기본공제 (250만원)
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          - 2,500,000원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <span className="text-sm font-medium text-text-primary">
                          과세표준
                        </span>
                        <span className="tabular-nums text-sm font-bold text-text-primary">
                          {fmt(result.taxBase)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          적용 세율
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.taxRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          양도소득세
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-negative">
                          {fmt(result.capitalGainsTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          지방소득세 (10%)
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-negative">
                          {fmt(result.localTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-primary bg-primary-light px-4 py-3">
                        <span className="text-sm font-bold text-text-primary">
                          총 세금
                        </span>
                        <span className="tabular-nums text-sm font-bold text-primary">
                          {fmt(result.totalTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-positive bg-positive-light px-4 py-3">
                        <span className="text-sm font-bold text-text-primary">
                          세후 순수익
                        </span>
                        <span className="tabular-nums text-sm font-bold text-positive">
                          {fmt(result.netProfit)}원
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="양도소득세 및 장기보유 특별공제 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">양도소득세란?</strong>
                    <p className="mt-0.5">
                      토지, 건물 등의 부동산을 팔아 얻은 이익(양도차익)에
                      부과되는 세금입니다. 양도차익 = 양도가액 - 취득가액 -
                      필요경비로 계산합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      장기보유 특별공제
                    </strong>
                    <p className="mt-0.5">
                      3년 이상 보유한 부동산에는 양도차익에서 일정 비율을
                      공제해 줍니다. 일반 부동산은 보유 3년 6%에서 시작해
                      15년 이상 시 최대 30%까지 공제됩니다. 1세대 1주택은
                      3년 이상 보유 시 연 8%씩 최대 80%까지 공제됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      1세대 1주택 비과세
                    </strong>
                    <p className="mt-0.5">
                      1세대가 양도일 현재 1주택만 보유하고, 2년 이상 보유한
                      경우(조정대상지역은 거주 요건 별도), 양도가액 12억 원
                      이하라면 양도소득세가 면제됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      필요경비란?
                    </strong>
                    <p className="mt-0.5">
                      취득 시 납부한 취득세, 법무사 비용, 부동산 중개수수료,
                      자본적 지출(리모델링, 발코니 확장 등), 양도 관련 비용
                      등이 포함됩니다. 양도차익에서 차감되어 세금이 줄어듭니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="capital-gains-tax" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="양도소득세 계산기 - Tooly"
                  description={`취득 ${fmt(acquisitionPrice)}원 → 양도 ${fmt(sellingPrice)}원 / 보유 ${holdingYears}년 → 총 세금 ${fmt(result.totalTax)}원`}
                />
              </div>

              {/* Quick summary card */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  요약
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">양도차익</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.gain)}원
                    </span>
                  </div>
                  {!isExempt && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">과세표준</span>
                        <span className="tabular-nums font-medium text-text-primary">
                          {fmt(result.taxBase)}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">적용 세율</span>
                        <span className="tabular-nums font-medium text-text-primary">
                          {result.taxRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="font-semibold text-text-primary">
                          총 세금
                        </span>
                        <span className="tabular-nums font-bold text-negative">
                          {fmt(result.totalTax)}원
                        </span>
                      </div>
                    </>
                  )}
                  {isExempt && (
                    <div className="border-t border-border pt-2">
                      <span className="font-bold text-positive">비과세</span>
                    </div>
                  )}
                </div>
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

export default function CapitalGainsTaxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <CapitalGainsTaxInner />
    </Suspense>
  );
}
