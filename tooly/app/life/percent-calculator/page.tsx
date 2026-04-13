"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  percentOf,
  whatPercent,
  percentChange,
} from "@/lib/calculators/percent";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

type Mode = "percentOf" | "whatPercent" | "percentChange";

const MODES: { id: Mode; label: string }[] = [
  { id: "percentOf", label: "A의 B%는?" },
  { id: "whatPercent", label: "A는 B의 몇 %?" },
  { id: "percentChange", label: "변화율" },
];

function fmt(n: number): string {
  if (!isFinite(n)) return "-";
  return n % 1 === 0 ? n.toLocaleString("ko-KR") : n.toLocaleString("ko-KR", { maximumFractionDigits: 4 });
}

function PercentCalculatorInner() {
  useSearchParams();

  const [mode, setMode] = useState<Mode>("percentOf");

  // Mode 1: percentOf — A의 B%는?
  const [poA, setPoA] = useState("");
  const [poB, setPoB] = useState("");

  // Mode 2: whatPercent — A는 B의 몇 %?
  const [wpA, setWpA] = useState("");
  const [wpB, setWpB] = useState("");

  // Mode 3: percentChange — From에서 To로
  const [pcFrom, setPcFrom] = useState("");
  const [pcTo, setPcTo] = useState("");

  const poResult =
    poA !== "" && poB !== ""
      ? percentOf(Number(poA), Number(poB))
      : null;

  const wpResult =
    wpA !== "" && wpB !== ""
      ? whatPercent(Number(wpA), Number(wpB))
      : null;

  const pcResult =
    pcFrom !== "" && pcTo !== ""
      ? percentChange(Number(pcFrom), Number(pcTo))
      : null;

  const calculator = getCalculator("percent-calculator");

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none";

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              퍼센트 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              퍼센트 값, 비율, 변화율을 간편하게 계산합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left */}
            <div className="flex-1 space-y-6">
              {/* Mode tabs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <div className="mb-5 flex gap-2 overflow-x-auto">
                  {MODES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                        mode === id
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Mode 1 */}
                {mode === "percentOf" && (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold text-text-primary">
                      A의 B%는?
                    </h2>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={poA}
                        onChange={(e) => setPoA(e.target.value)}
                        placeholder="A (값)"
                        className={inputClass}
                      />
                      <span className="shrink-0 text-sm text-text-secondary">의</span>
                      <input
                        type="number"
                        value={poB}
                        onChange={(e) => setPoB(e.target.value)}
                        placeholder="B (%)"
                        className={inputClass}
                      />
                      <span className="shrink-0 text-sm text-text-secondary">%</span>
                    </div>
                    <div className="rounded-xl border border-primary bg-primary-light p-5">
                      <p className="text-xs font-medium text-text-secondary">계산 결과</p>
                      <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                        {poResult !== null ? fmt(poResult) : "-"}
                      </p>
                      {poResult !== null && poA !== "" && poB !== "" && (
                        <p className="mt-2 text-xs text-text-secondary">
                          계산식: {fmt(Number(poA))} × {fmt(Number(poB))} ÷ 100 = {fmt(poResult)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode 2 */}
                {mode === "whatPercent" && (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold text-text-primary">
                      A는 B의 몇 %?
                    </h2>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={wpA}
                        onChange={(e) => setWpA(e.target.value)}
                        placeholder="A (부분)"
                        className={inputClass}
                      />
                      <span className="shrink-0 text-sm text-text-secondary">는</span>
                      <input
                        type="number"
                        value={wpB}
                        onChange={(e) => setWpB(e.target.value)}
                        placeholder="B (전체)"
                        className={inputClass}
                      />
                      <span className="shrink-0 text-sm text-text-secondary">의</span>
                    </div>
                    <div className="rounded-xl border border-primary bg-primary-light p-5">
                      <p className="text-xs font-medium text-text-secondary">계산 결과</p>
                      <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                        {wpResult !== null ? `${fmt(wpResult)}%` : "-"}
                      </p>
                      {wpResult !== null && wpA !== "" && wpB !== "" && (
                        <p className="mt-2 text-xs text-text-secondary">
                          계산식: {fmt(Number(wpA))} ÷ {fmt(Number(wpB))} × 100 = {fmt(wpResult)}%
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Mode 3 */}
                {mode === "percentChange" && (
                  <div className="space-y-4">
                    <h2 className="text-base font-semibold text-text-primary">
                      변화율 계산 (From → To)
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-text-secondary">
                          이전 값 (From)
                        </label>
                        <input
                          type="number"
                          value={pcFrom}
                          onChange={(e) => setPcFrom(e.target.value)}
                          placeholder="이전 값"
                          className={inputClass}
                        />
                      </div>
                      <span className="mt-4 shrink-0 text-lg text-text-secondary">→</span>
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-text-secondary">
                          이후 값 (To)
                        </label>
                        <input
                          type="number"
                          value={pcTo}
                          onChange={(e) => setPcTo(e.target.value)}
                          placeholder="이후 값"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-primary bg-primary-light p-5">
                      <p className="text-xs font-medium text-text-secondary">변화율</p>
                      <p className={`mt-1 text-3xl font-bold tabular-nums ${
                        pcResult !== null && pcResult > 0
                          ? "text-positive"
                          : pcResult !== null && pcResult < 0
                          ? "text-negative"
                          : "text-primary"
                      }`}>
                        {pcResult !== null
                          ? `${pcResult > 0 ? "+" : ""}${fmt(pcResult)}%`
                          : "-"}
                      </p>
                      {pcResult !== null && pcFrom !== "" && pcTo !== "" && (
                        <p className="mt-2 text-xs text-text-secondary">
                          계산식: ({fmt(Number(pcTo))} - {fmt(Number(pcFrom))}) ÷ |{fmt(Number(pcFrom))}| × 100 = {pcResult > 0 ? "+" : ""}{fmt(pcResult)}%
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <AdSlot type="inline" />

              <GuideText title="퍼센트 개념 설명">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">퍼센트(%)란?</strong>
                    <p className="mt-0.5">
                      전체를 100으로 놓았을 때의 비율입니다. 예를 들어 50%는 전체의 절반을 의미합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">A의 B%는?</strong>
                    <p className="mt-0.5">
                      A × B ÷ 100으로 계산합니다. 예: 200의 15% = 200 × 15 ÷ 100 = 30
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">A는 B의 몇 %?</strong>
                    <p className="mt-0.5">
                      A ÷ B × 100으로 계산합니다. 예: 30이 200의 몇 %? = 30 ÷ 200 × 100 = 15%
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">변화율</strong>
                    <p className="mt-0.5">
                      (이후 값 - 이전 값) ÷ |이전 값| × 100으로 계산합니다. 양수면 증가, 음수면 감소를 의미합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활용 예시</strong>
                    <ul className="mt-0.5 list-disc pl-4">
                      <li>할인율 계산: 정가 50,000원에서 15% 할인 → 50,000의 15% = 7,500원 할인</li>
                      <li>성장률 계산: 매출 100만 → 120만 → 변화율 +20%</li>
                      <li>비율 계산: 30명 중 12명이 합격 → 12는 30의 40%</li>
                    </ul>
                  </div>
                </div>
              </GuideText>

              <RelatedCalculators calculatorId="percent-calculator" />
            </div>

            {/* Right: Share + Ad */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Quick reference */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  계산 공식 참고
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between rounded-lg bg-surface px-3 py-2">
                    <span className="text-text-secondary">A의 B%</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      A × B ÷ 100
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-surface px-3 py-2">
                    <span className="text-text-secondary">A는 B의 몇 %?</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      A ÷ B × 100
                    </span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-surface px-3 py-2">
                    <span className="text-text-secondary">변화율</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      (To - From) ÷ |From| × 100
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="퍼센트 계산기 - Tooly"
                  description="퍼센트 값, 비율, 변화율을 간편하게 계산해 보세요."
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

export default function PercentCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <PercentCalculatorInner />
    </Suspense>
  );
}
