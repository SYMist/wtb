"use client";

import { useState, useMemo } from "react";

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
  taxFree: "비과세종합저축 등 (0%)",
  cooperativeRuralExempt: "조합 예탁금 농특세 면제 (0%)",
  cooperativeExempt: "조합 예탁금 저율과세 (1.4%)",
  cooperative2026: "조합 예탁금 저율분리과세 (5.9%)",
  preferential: "세금우대종합저축 (9.5% · 신규가입 종료)",
};

export interface DepositCalculatorClientProps {
  initialAmount: number;
  initialRate: number;
  initialMonths: number;
  initialType: ProductType;
  initialMethod: InterestMethod;
  initialTax: TaxType;
}

export default function DepositCalculatorClient({
  initialAmount,
  initialRate,
  initialMonths,
  initialType,
  initialMethod,
  initialTax,
}: DepositCalculatorClientProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [annualRate, setAnnualRate] = useState(initialRate);
  const [months, setMonths] = useState(initialMonths);
  const [productType, setProductType] = useState<ProductType>(initialType);
  const [interestMethod, setInterestMethod] =
    useState<InterestMethod>(initialMethod);
  const [taxType, setTaxType] = useState<TaxType>(initialTax);

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
                      이자소득과 농어촌특별세가 모두 면제되는 상품을 위한
                      선택입니다. 비과세종합저축은 2026년 신규 가입 기준으로
                      65세 이상 기초연금 수급자 또는 법정 대상자 등이, 모든
                      금융회사 합산 원금 5천만원 한도에서 신청할 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      조합 예탁금 농특세 면제 (0%)
                    </strong>
                    <p className="mt-0.5">
                      조합 예탁금 중 농어촌특별세법상 비과세 대상인 농어민·일부
                      임업인 등의 이자소득 감면은 농어촌특별세도 면제될 수
                      있습니다. 조합원이라고 자동 적용되는 항목이 아니므로,
                      금융회사 확인서에 면제 세율이 표시된 경우에만 선택하세요.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      조합 예탁금 저율과세 (1.4%)
                    </strong>
                    <p className="mt-0.5">
                      신협·농협·수협·새마을금고·산림조합 등의 조합원 예탁금
                      중 2025년까지 가입한 3천만원 이하 합산 예탁금, 또는
                      2026~2028년 법정 소득요건을 충족해 가입한 예탁금에
                      적용될 수 있습니다. 소득세 면제분에 농어촌특별세 1.4%를
                      더한 값이며, 바로 위 농특세 면제 대상은 0%를 선택합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      조합 예탁금 저율분리과세 (5.9%)
                    </strong>
                    <p className="mt-0.5">
                      위 1.4% 자격을 충족하지 않고 2026년에 새로 가입한
                      조합 예탁금의 세율입니다. 소득세 5%와 농어촌특별세
                      0.9%를 합산했으며, 2027년 이후 신규 가입분의 세율은
                      달라질 수 있습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">
                      세금우대종합저축 (9.5%)
                    </strong>
                    <p className="mt-0.5">
                      2014년 12월 31일까지 가입한 기존 세금우대종합저축의
                      경과 상품입니다. 소득세 9%와 농어촌특별세 0.5%를
                      합산한 세율이며, 새로 가입할 수 있는 조합 예탁금의
                      세율이 아닙니다.
                    </p>
                  </div>
                  <p className="border-t border-border pt-3 text-xs text-text-secondary">
                    이 결과는 선택한 세율로 계산한 원천징수 추정액입니다.
                    실제 적용은 가입일·재예치·중도해지·상품별 한도와 자격을
                    금융회사에서 확인해야 합니다. 일반과세 이자·배당소득은
                    연간 합계가 2천만원을 초과하면 종합과세로 최종 세액이
                    달라질 수 있습니다. 기준일: 2026년 9월 27일. {" "}
                    <a
                      className="text-primary underline"
                      href="https://www.law.go.kr/LSW/lsSideInfoP.do?docCls=jo&joBrNo=03&joNo=0089&lsiSeq=284389&urlMode=lsScJoRltInfoR"
                      target="_blank"
                      rel="noreferrer"
                    >
                      조세특례제한법 제89조의3
                    </a>
                  </p>
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
