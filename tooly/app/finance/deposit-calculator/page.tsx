"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  calculateDeposit,
  type ProductType,
  type InterestMethod,
  type TaxType,
} from "@/lib/calculators/deposit";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

const MONTH_OPTIONS = [1, 3, 6, 12, 24, 36, 48, 60];

const TAX_LABELS: Record<TaxType, string> = {
  normal: "일반과세 (15.4%)",
  taxFree: "비과세 (0%)",
  preferential: "세금우대 (9.5%)",
};

function DepositCalculatorInner() {
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState(() => {
    const v = searchParams.get("amount");
    return v ? Number(v) : 10_000_000;
  });
  const [annualRate, setAnnualRate] = useState(() => {
    const v = searchParams.get("rate");
    return v ? Number(v) : 3.5;
  });
  const [months, setMonths] = useState(() => {
    const v = searchParams.get("months");
    return v ? Number(v) : 12;
  });
  const [productType, setProductType] = useState<ProductType>(() => {
    const v = searchParams.get("type");
    return (v as ProductType) || "deposit";
  });
  const [interestMethod, setInterestMethod] = useState<InterestMethod>(() => {
    const v = searchParams.get("method");
    return (v as InterestMethod) || "simple";
  });
  const [taxType, setTaxType] = useState<TaxType>(() => {
    const v = searchParams.get("tax");
    return (v as TaxType) || "normal";
  });

  const result = useMemo(
    () =>
      calculateDeposit({
        amount,
        annualRate,
        months,
        productType,
        interestMethod,
        taxType,
      }),
    [amount, annualRate, months, productType, interestMethod, taxType]
  );

  const calculator = getCalculator("deposit-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              예적금 이자 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              예금·적금 이자를 세전/세후로 계산하고 만기 수령액을 확인하세요.
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
                  계산 조건 입력
                </h2>

                {/* 상품유형 toggle */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    상품유형
                  </label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {(["deposit", "savings"] as ProductType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setProductType(type)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${
                          productType === type
                            ? "bg-primary text-white"
                            : "bg-background text-text-secondary hover:bg-surface"
                        }`}
                      >
                        {type === "deposit" ? "정기예금" : "적금"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 단리/월복리 toggle (적금만) */}
                {productType === "savings" && (
                  <div className="mb-5">
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      이자 계산 방식
                    </label>
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {(["simple", "compound"] as InterestMethod[]).map(
                        (method) => (
                          <button
                            key={method}
                            onClick={() => setInterestMethod(method)}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                              interestMethod === method
                                ? "bg-primary text-white"
                                : "bg-background text-text-secondary hover:bg-surface"
                            }`}
                          >
                            {method === "simple" ? "단리" : "월복리"}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 예치금액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>
                      {productType === "deposit" ? "예치금액" : "월 적립액"}
                    </span>
                    <span className="tabular-nums text-primary">
                      {fmt(amount)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) =>
                        setAmount(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={100_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 이자율 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>연이자율</span>
                    <span className="tabular-nums text-primary">
                      {annualRate.toFixed(2)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={10}
                    step={0.05}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      value={annualRate}
                      onChange={(e) =>
                        setAnnualRate(
                          Math.min(10, Math.max(0.1, Number(e.target.value)))
                        )
                      }
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={0.05}
                      min={0.1}
                      max={10}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      %
                    </span>
                  </div>
                </div>

                {/* 기간 */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    기간
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MONTH_OPTIONS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMonths(m)}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                          months === m
                            ? "border-primary bg-primary text-white"
                            : "border-border text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {m >= 12 ? `${m / 12}년` : `${m}개월`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 이자과세 */}
                <div className="mb-0">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    이자과세
                  </label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value as TaxType)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  >
                    {(Object.keys(TAX_LABELS) as TaxType[]).map((t) => (
                      <option key={t} value={t}>
                        {TAX_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* Maturity highlight */}
                <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                  <p className="text-xs font-medium text-text-secondary">
                    만기 수령액
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                    {fmt(result.maturityAmount)}
                    <span className="ml-1 text-lg font-medium">원</span>
                  </p>
                  {productType === "savings" && (
                    <p className="mt-1 text-xs text-text-secondary">
                      총 납입액:{" "}
                      <span className="tabular-nums font-medium text-text-primary">
                        {fmt(result.totalDeposited)}원
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">세전이자</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
                      {fmt(result.preTaxInterest)}원
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">세후이자</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-positive">
                      {fmt(result.postTaxInterest)}원
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">이자세금</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-negative">
                      {fmt(result.tax)}원
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">적용세율</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-text-primary">
                      {result.taxRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="이자과세 유형 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">
                      일반과세 (15.4%)
                    </strong>
                    <p className="mt-0.5">
                      이자소득에 소득세 14%와 지방소득세 1.4%를 합한
                      15.4%가 원천징수됩니다. 대부분의 금융 상품에 적용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">비과세 (0%)</strong>
                    <p className="mt-0.5">
                      이자소득세가 전혀 없습니다. 비과세종합저축(65세 이상,
                      장애인 등), 청년우대형 청약통장 등 일부 상품에 한해
                      적용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      세금우대 (9.5%)
                    </strong>
                    <p className="mt-0.5">
                      농어촌특별세 1.4%만 부과되어 세율이 낮습니다. 신협,
                      농협, 수협, 산림조합 등의 조합원 예탁금에 한해
                      적용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      단리 vs 월복리 (적금)
                    </strong>
                    <p className="mt-0.5">
                      단리는 원금에 대해서만 이자가 붙는 방식이고, 월복리는
                      매월 이자가 원금에 합산되어 다음 달 이자 계산의 기준이
                      되는 방식입니다. 기간이 길수록 월복리가 유리합니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="deposit-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="예적금 이자 계산기 - Tooly"
                  description={`${productType === "deposit" ? "예치금" : "월 적립액"} ${fmt(amount)}원 / ${annualRate}% / ${months}개월 → 만기수령액 ${fmt(result.maturityAmount)}원`}
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

export default function DepositCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <DepositCalculatorInner />
    </Suspense>
  );
}
