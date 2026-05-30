"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  pyeongToSqm,
  sqmToPyeong,
  commonApartmentSizes,
} from "@/lib/calculators/area";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const PYEONG_TO_SQM = 3.305785;

function AreaConverterInner() {
  const searchParams = useSearchParams();

  const [pyeong, setPyeong] = useState<string>(() => {
    const v = searchParams.get("pyeong");
    return v ?? "25";
  });

  const [sqm, setSqm] = useState<string>(() => {
    const v = searchParams.get("sqm");
    if (v) return v;
    const initPyeong = searchParams.get("pyeong");
    return initPyeong
      ? String(pyeongToSqm(Number(initPyeong)))
      : String(pyeongToSqm(25));
  });

  function handlePyeongChange(raw: string) {
    setPyeong(raw);
    const n = Number(raw);
    if (raw !== "" && !isNaN(n) && n >= 0) {
      setSqm(String(pyeongToSqm(n)));
    } else if (raw === "") {
      setSqm("");
    }
  }

  function handleSqmChange(raw: string) {
    setSqm(raw);
    const n = Number(raw);
    if (raw !== "" && !isNaN(n) && n >= 0) {
      setPyeong(String(sqmToPyeong(n)));
    } else if (raw === "") {
      setPyeong("");
    }
  }

  function selectSize(p: number, s: number) {
    setPyeong(String(p));
    setSqm(String(s));
  }

  const calculator = getCalculator("area-converter");

  const pyeongNum = Number(pyeong);
  const sqmNum = Number(sqm);
  const validInput = pyeong !== "" && !isNaN(pyeongNum) && pyeongNum >= 0;

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              평수 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              평(坪)과 제곱미터(m²)를 양방향으로 즉시 변환합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs ── */}
            <div className="flex-1 space-y-6">
              {/* Bidirectional inputs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  면적 변환
                </h2>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* 평수 input */}
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      평수 (평)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={pyeong}
                        onChange={(e) => handlePyeongChange(e.target.value)}
                        placeholder="평수 입력"
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                        min={0}
                        step={1}
                      />
                      <span className="flex items-center text-sm text-text-secondary">
                        평
                      </span>
                    </div>
                  </div>

                  {/* Swap icon */}
                  <div className="flex justify-center sm:mt-5">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-text-secondary sm:rotate-0 rotate-90"
                    >
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="M7 23l-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  </div>

                  {/* 제곱미터 input */}
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      제곱미터 (m²)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={sqm}
                        onChange={(e) => handleSqmChange(e.target.value)}
                        placeholder="m² 입력"
                        className="w-full rounded-lg border border-border px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none"
                        min={0}
                        step={0.01}
                      />
                      <span className="flex items-center text-sm text-text-secondary">
                        m²
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick result */}
                {validInput && (
                  <div className="mt-4 rounded-lg bg-primary-light px-4 py-3 text-sm text-text-secondary">
                    <span className="tabular-nums font-semibold text-primary">
                      {pyeongNum.toLocaleString("ko-KR")}평
                    </span>{" "}
                    ={" "}
                    <span className="tabular-nums font-semibold text-primary">
                      {sqmNum.toLocaleString("ko-KR")}m²
                    </span>
                  </div>
                )}
              </div>

              {/* Ad slot (inline) */}
              <AdSlot type="inline" />

              {/* Common apartment sizes reference table */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  일반 아파트 평형 참고표
                </h2>
                <p className="mb-3 text-xs text-text-secondary">
                  클릭하면 해당 평형으로 자동 입력됩니다.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-text-secondary">
                          평형
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          평수 (평)
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          제곱미터 (m²)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {commonApartmentSizes.map((apt) => (
                        <tr
                          key={apt.pyeong}
                          onClick={() => selectSize(apt.pyeong, apt.sqm)}
                          className={`cursor-pointer transition-colors hover:bg-surface ${
                            pyeongNum === apt.pyeong ? "bg-primary-light" : ""
                          }`}
                        >
                          <td className="py-2.5 font-medium text-text-primary">
                            {apt.label}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-text-primary">
                            {apt.pyeong}평
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-text-primary">
                            {apt.sqm}m²
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Guide */}
              <GuideText title="평수 환산 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">1평은 몇 m²인가요?</strong>
                    <p className="mt-0.5">
                      1평 = 3.305785m²입니다. 정확히는 1평 = 6척 × 6척 = 약
                      3.3058m²로, 일상에서는 3.3m²로 간략히 계산하기도 합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">평형과 전용면적의 차이</strong>
                    <p className="mt-0.5">
                      아파트 광고에 표시되는 평형은 공급면적(전용면적 + 공용면적)을
                      기준으로 합니다. 실제 생활 공간인 전용면적은 공급면적보다
                      작습니다. 계약 시 전용면적을 반드시 확인하세요.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">환산 공식</strong>
                    <p className="mt-0.5">
                      평 → m²: 평수 × 3.305785<br />
                      m² → 평: 제곱미터 ÷ 3.305785
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related calculators */}
              <RelatedCalculators calculatorId="area-converter" />
            </div>

            {/* ── Right: Results sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Main result card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">변환 결과</p>
                {validInput ? (
                  <>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {sqmNum.toLocaleString("ko-KR")}
                      <span className="ml-1 text-lg font-medium">m²</span>
                    </p>
                    <p className="mt-1 text-sm tabular-nums text-text-secondary">
                      = {pyeongNum.toLocaleString("ko-KR")}평
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-primary/20 pt-3">
                      <div>
                        <p className="text-xs text-text-secondary">평수</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {pyeongNum.toLocaleString("ko-KR")}평
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">제곱미터</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {sqmNum.toLocaleString("ko-KR")}m²
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    평수 또는 m²를 입력하세요
                  </p>
                )}
              </div>

              {/* Conversion factor info */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  환산 계수
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">1평</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {PYEONG_TO_SQM}m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">1m²</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {(1 / PYEONG_TO_SQM).toFixed(6)}평
                    </span>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="평수 계산기 - Tooly"
                  description={
                    validInput
                      ? `${pyeongNum.toLocaleString("ko-KR")}평 = ${sqmNum.toLocaleString("ko-KR")}m²`
                      : "평수와 m²를 간편하게 변환하세요"
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

export default function AreaConverterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <AreaConverterInner />
    </Suspense>
  );
}
