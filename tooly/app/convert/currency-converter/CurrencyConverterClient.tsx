"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  convert,
  getRates,
  supportedCurrencies,
} from "@/lib/calculators/currency";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const { rates, updatedAt } = getRates();

function fmtAmount(n: number, code: string): string {
  if (code === "JPY") {
    return Math.round(n).toLocaleString("ko-KR");
  }
  if (code === "KRW") {
    return Math.round(n).toLocaleString("ko-KR");
  }
  return n.toLocaleString("ko-KR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    KRW: "₩",
    USD: "$",
    EUR: "€",
    JPY: "¥",
    CNY: "¥",
    GBP: "£",
  };
  return symbols[code] ?? code;
}

function CurrencyConverterInner() {
  const searchParams = useSearchParams();

  const [fromCode, setFromCode] = useState(() => {
    const v = searchParams.get("from");
    return supportedCurrencies.find((c) => c.code === v)?.code ?? "KRW";
  });

  const [toCode, setToCode] = useState(() => {
    const v = searchParams.get("to");
    return supportedCurrencies.find((c) => c.code === v)?.code ?? "USD";
  });

  const [fromAmount, setFromAmount] = useState<string>(() => {
    const v = searchParams.get("amount");
    return v ?? "10000";
  });

  const [toAmount, setToAmount] = useState<string>(() => {
    const v = searchParams.get("amount");
    const init = v ? Number(v) : 10000;
    const fromInit = searchParams.get("from") ?? "KRW";
    const toInit = searchParams.get("to") ?? "USD";
    const converted = convert(init, fromInit, toInit);
    return String(converted);
  });

  function handleFromAmountChange(raw: string) {
    setFromAmount(raw);
    const n = Number(raw);
    if (raw !== "" && !isNaN(n) && n >= 0) {
      const converted = convert(n, fromCode, toCode);
      setToAmount(String(converted));
    } else if (raw === "") {
      setToAmount("");
    }
  }

  function handleToAmountChange(raw: string) {
    setToAmount(raw);
    const n = Number(raw);
    if (raw !== "" && !isNaN(n) && n >= 0) {
      const converted = convert(n, toCode, fromCode);
      setFromAmount(String(converted));
    } else if (raw === "") {
      setFromAmount("");
    }
  }

  function handleFromCodeChange(code: string) {
    setFromCode(code);
    const n = Number(fromAmount);
    if (!isNaN(n) && n >= 0) {
      const converted = convert(n, code, toCode);
      setToAmount(String(converted));
    }
  }

  function handleToCodeChange(code: string) {
    setToCode(code);
    const n = Number(fromAmount);
    if (!isNaN(n) && n >= 0) {
      const converted = convert(n, fromCode, code);
      setToAmount(String(converted));
    }
  }

  function handleSwap() {
    setFromCode(toCode);
    setToCode(fromCode);
    setFromAmount(toAmount);
    const n = Number(toAmount);
    if (!isNaN(n) && n >= 0) {
      const converted = convert(n, toCode, fromCode);
      setToAmount(String(converted));
    }
  }

  const fromNum = Number(fromAmount);
  const toNum = Number(toAmount);
  const validInput = fromAmount !== "" && !isNaN(fromNum) && fromNum >= 0;

  // Exchange rate display: 1 fromCode = ? toCode
  const unitRate = convert(1, fromCode, toCode);
  const reverseRate = convert(1, toCode, fromCode);

  const fromCurrency = supportedCurrencies.find((c) => c.code === fromCode);
  const toCurrency = supportedCurrencies.find((c) => c.code === toCode);

  const calculator = getCalculator("currency-converter");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              환율 변환기
            </h1>
            <p className="mt-2 text-text-secondary">
              주요 통화 간 환율을 즉시 변환합니다. 한국수출입은행 기준 환율.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs ── */}
            <div className="flex-1 space-y-6">
              {/* Converter inputs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  환율 변환
                </h2>

                {/* From */}
                <div className="mb-3">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    변환할 금액
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={fromCode}
                      onChange={(e) => handleFromCodeChange(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      {supportedCurrencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      placeholder="금액 입력"
                      className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={0}
                      step="any"
                    />
                  </div>
                </div>

                {/* Swap button */}
                <div className="my-3 flex justify-center">
                  <button
                    onClick={handleSwap}
                    className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    통화 교체
                  </button>
                </div>

                {/* To */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    변환 결과
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={toCode}
                      onChange={(e) => handleToCodeChange(e.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      {supportedCurrencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      placeholder="변환 결과"
                      className="min-w-0 flex-1 rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={0}
                      step="any"
                    />
                  </div>
                </div>

                {/* Rate info */}
                {validInput && (
                  <div className="rounded-lg bg-surface px-4 py-3 text-sm text-text-secondary">
                    <p className="tabular-nums">
                      <span className="font-semibold text-text-primary">
                        1 {fromCode}
                      </span>{" "}
                      ={" "}
                      <span className="font-semibold text-primary tabular-nums">
                        {fmtAmount(unitRate, toCode)} {toCode}
                      </span>
                    </p>
                    <p className="mt-0.5 tabular-nums">
                      <span className="font-semibold text-text-primary">
                        1 {toCode}
                      </span>{" "}
                      ={" "}
                      <span className="tabular-nums">
                        {fmtAmount(reverseRate, fromCode)} {fromCode}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Ad slot (inline) */}
              <AdSlot type="inline" />

              {/* All rates reference table */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-1 text-base font-semibold text-text-primary">
                  주요 통화 환율표
                </h2>
                <p className="mb-4 text-xs text-text-secondary">
                  환율 기준: 한국수출입은행, 업데이트: {updatedAt}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-text-secondary">
                          통화
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          KRW 기준 환율
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          1 KRW =
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rates.map((r) => (
                        <tr
                          key={r.code}
                          className="transition-colors hover:bg-surface"
                        >
                          <td className="py-2.5">
                            <span className="font-medium text-text-primary">
                              {r.code}
                            </span>
                            <span className="ml-2 text-text-secondary">
                              {r.currency}
                            </span>
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-text-primary">
                            {r.code === "JPY"
                              ? `${r.rate.toLocaleString("ko-KR")}원 / 100엔`
                              : `${r.rate.toLocaleString("ko-KR")}원`}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-text-secondary">
                            {r.code === "JPY"
                              ? `${(100 / r.rate).toLocaleString("ko-KR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} JPY`
                              : `${(1 / r.rate).toLocaleString("ko-KR", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} ${r.code}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guide */}
              <GuideText title="환율 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">환율이란?</strong>
                    <p className="mt-0.5">
                      한 나라의 통화를 다른 나라의 통화로 교환할 때 적용되는
                      비율입니다. 환율은 외환시장에서 수요와 공급에 의해 결정되며,
                      매일 변동됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">환율 출처</strong>
                    <p className="mt-0.5">
                      이 계산기는 한국수출입은행 환율 정보를 기반으로 합니다.
                      실제 환전 시에는 은행 고시환율 및 환전 수수료가 적용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">JPY 환율 단위</strong>
                    <p className="mt-0.5">
                      일본 엔(JPY) 환율은 100엔 기준으로 고시됩니다.
                      예) 920원/100엔 = 1엔당 9.2원.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related calculators */}
              <RelatedCalculators calculatorId="currency-converter" />
            </div>

            {/* ── Right: Results sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Main result card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  변환 결과
                </p>
                {validInput ? (
                  <>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {getCurrencySymbol(toCode)}{" "}
                      {fmtAmount(toNum, toCode)}
                    </p>
                    <p className="mt-1 text-sm tabular-nums text-text-secondary">
                      {getCurrencySymbol(fromCode)}{" "}
                      {fmtAmount(fromNum, fromCode)} {fromCode} →{" "}
                      {toCode}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                      <div>
                        <p className="text-xs text-text-secondary">기준 통화</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {fromCode} ({fromCurrency?.name})
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">대상 통화</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {toCode} ({toCurrency?.name})
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    금액을 입력하세요
                  </p>
                )}
              </div>

              {/* Rate info card */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  현재 적용 환율
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      1 {fromCode} →
                    </span>
                    <span className="tabular-nums font-semibold text-text-primary">
                      {fmtAmount(unitRate, toCode)} {toCode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      1 {toCode} →
                    </span>
                    <span className="tabular-nums font-semibold text-text-primary">
                      {fmtAmount(reverseRate, fromCode)} {fromCode}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-text-secondary">
                  환율 기준: 한국수출입은행
                  <br />
                  업데이트: {updatedAt}
                </p>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="환율 변환기 - Tooly"
                  description={
                    validInput
                      ? `${fmtAmount(fromNum, fromCode)} ${fromCode} = ${fmtAmount(toNum, toCode)} ${toCode} (${updatedAt} 기준)`
                      : "주요 통화 환율을 즉시 변환하세요"
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

export default function CurrencyConverterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <CurrencyConverterInner />
    </Suspense>
  );
}
