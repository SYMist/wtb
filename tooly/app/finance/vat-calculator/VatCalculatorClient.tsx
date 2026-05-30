"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calcVatFromSupply, calcVatFromTotal } from "@/lib/calculators/vat";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

type Mode = "supply" | "total";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function VatCalculatorInner() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>(() => {
    const v = searchParams.get("mode");
    return v === "total" ? "total" : "supply";
  });

  const [amount, setAmount] = useState(() => {
    const v = searchParams.get("amount");
    return v ? Number(v) : 1_000_000;
  });

  const [vatRate, setVatRate] = useState(() => {
    const v = searchParams.get("rate");
    return v ? Number(v) : 10;
  });

  const result =
    mode === "supply"
      ? calcVatFromSupply(amount, vatRate / 100)
      : calcVatFromTotal(amount, vatRate / 100);

  const calculator = getCalculator("vat-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              부가세 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              공급가액에서 부가세를 계산하거나, 합계금액에서 부가세를 추출합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs ── */}
            <div className="flex-1 space-y-6">
              {/* Mode toggle */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 방식 선택
                </h2>
                <div className="flex rounded-lg border border-border p-1">
                  <button
                    onClick={() => setMode("supply")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      mode === "supply"
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    공급가액 → 합계
                  </button>
                  <button
                    onClick={() => setMode("total")}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      mode === "total"
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    합계 → 공급가액
                  </button>
                </div>
              </div>

              {/* Inputs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  금액 입력
                </h2>

                {/* Main amount */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    {mode === "supply" ? "공급가액" : "합계금액"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount || ""}
                      placeholder="금액을 입력하세요"
                      onChange={(e) =>
                        setAmount(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={0}
                      step={1000}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* VAT rate */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>부가세율</span>
                    <span className="tabular-nums text-primary">
                      {vatRate}%
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={vatRate}
                      onChange={(e) =>
                        setVatRate(
                          Math.min(100, Math.max(0, Number(e.target.value)))
                        )
                      }
                      className="w-28 rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={0}
                      max={100}
                      step={1}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      %
                    </span>
                    <button
                      onClick={() => setVatRate(10)}
                      className="rounded-lg border border-border px-3 py-2 text-xs text-text-secondary transition-colors hover:border-primary hover:text-primary"
                    >
                      기본 10%
                    </button>
                  </div>
                </div>
              </div>

              {/* Ad slot (inline) */}
              <AdSlot type="inline" />

              {/* Result breakdown table */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>
                <div className="divide-y divide-border">
                  <div
                    className={`flex items-center justify-between py-3 ${
                      mode === "supply" ? "" : "rounded-lg bg-primary-light px-3"
                    }`}
                  >
                    <span className="text-sm text-text-secondary">공급가액</span>
                    <span
                      className={`tabular-nums text-base font-semibold ${
                        mode === "total"
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {fmt(result.supplyPrice)}원
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-text-secondary">
                      부가세 ({vatRate}%)
                    </span>
                    <span className="tabular-nums text-base font-semibold text-text-primary">
                      {fmt(result.vat)}원
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-between py-3 ${
                      mode === "total" ? "" : "rounded-lg bg-primary-light px-3"
                    }`}
                  >
                    <span className="text-sm text-text-secondary">합계금액</span>
                    <span
                      className={`tabular-nums text-base font-semibold ${
                        mode === "supply"
                          ? "text-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {fmt(result.totalPrice)}원
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide */}
              <GuideText title="부가가치세 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">부가가치세(VAT)란?</strong>
                    <p className="mt-0.5">
                      상품이나 서비스의 거래 시 부과되는 간접세입니다. 한국에서는
                      일반적으로 10%가 적용됩니다. 사업자는 소비자로부터 받은
                      부가세를 국가에 납부해야 합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">공급가액 → 합계금액</strong>
                    <p className="mt-0.5">
                      세금계산서 발행 시 사용합니다. 공급가액에 부가세율을 곱해
                      부가세를 산출하고, 공급가액에 더하면 합계금액이 됩니다.
                      예) 1,000,000원 × 10% = 100,000원 → 합계 1,100,000원
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">합계금액 → 공급가액</strong>
                    <p className="mt-0.5">
                      소비자가 지불한 가격에서 부가세를 역산할 때 사용합니다.
                      합계금액 ÷ (1 + 부가세율)로 공급가액을 구합니다.
                      예) 1,100,000원 ÷ 1.1 = 1,000,000원 (공급가액)
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related calculators */}
              <RelatedCalculators calculatorId="vat-calculator" />
            </div>

            {/* ── Right: Results sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Main result card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  {mode === "supply" ? "합계금액 (VAT 포함)" : "공급가액 (VAT 별도)"}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {mode === "supply"
                    ? fmt(result.totalPrice)
                    : fmt(result.supplyPrice)}
                  <span className="ml-1 text-lg font-medium">원</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                  <div>
                    <p className="text-xs text-text-secondary">공급가액</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {fmt(result.supplyPrice)}원
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">부가세</p>
                    <p className="tabular-nums text-sm font-semibold text-text-primary">
                      {fmt(result.vat)}원
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate info */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  부가세율 정보
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">일반세율</span>
                    <span className="tabular-nums font-medium text-text-primary">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">영세율</span>
                    <span className="tabular-nums font-medium text-text-primary">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">면세</span>
                    <span className="font-medium text-text-primary">해당 없음</span>
                  </div>
                  <p className="mt-2 text-xs text-text-secondary">
                    현재 적용 중: <span className="font-semibold tabular-nums text-primary">{vatRate}%</span>
                  </p>
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="부가세 계산기 - Tooly"
                  description={
                    mode === "supply"
                      ? `공급가액 ${fmt(result.supplyPrice)}원 → 부가세 ${fmt(result.vat)}원 → 합계 ${fmt(result.totalPrice)}원`
                      : `합계 ${fmt(result.totalPrice)}원 → 공급가액 ${fmt(result.supplyPrice)}원 / 부가세 ${fmt(result.vat)}원`
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

export default function VatCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <VatCalculatorInner />
    </Suspense>
  );
}
