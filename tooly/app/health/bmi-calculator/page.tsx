"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { calculateBmi, BMI_CATEGORIES } from "@/lib/calculators/bmi";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

// BMI 게이지 바에서 사용할 전체 범위
const BMI_MIN = 10;
const BMI_MAX = 40;

function getBmiPosition(bmi: number): number {
  const clamped = Math.min(Math.max(bmi, BMI_MIN), BMI_MAX);
  return ((clamped - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100;
}

// 각 카테고리 구간의 너비(%) 계산
const GAUGE_SEGMENTS = [
  { label: "저체중", max: 18.5, color: "#3B82F6" },
  { label: "정상", max: 23, color: "#16A34A" },
  { label: "과체중", max: 25, color: "#EAB308" },
  { label: "비만", max: 30, color: "#F97316" },
  { label: "고도비만", max: BMI_MAX, color: "#DC2626" },
];

function BmiCalculatorInner() {
  const searchParams = useSearchParams();

  const [height, setHeight] = useState(() => {
    const v = searchParams.get("height");
    return v ? Number(v) : 170;
  });
  const [weight, setWeight] = useState(() => {
    const v = searchParams.get("weight");
    return v ? Number(v) : 70;
  });

  const result = useMemo(() => calculateBmi(height, weight), [height, weight]);

  const calculator = getCalculator("bmi-calculator");

  const markerPos = getBmiPosition(result.bmi);

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              BMI 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              키와 체중을 입력하면 체질량지수(BMI)와 비만도를 즉시 확인할 수 있습니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left: Main content */}
            <div className="flex-1 space-y-6">
              {/* Inputs */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-5 text-base font-semibold text-text-primary">
                  신체 정보 입력
                </h2>

                {/* 키 */}
                <div className="mb-6">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>키</span>
                    <span className="tabular-nums text-primary">{height} cm</span>
                  </label>
                  <input
                    type="range"
                    min={100}
                    max={220}
                    step={1}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={height}
                      onChange={(e) =>
                        setHeight(
                          Math.min(220, Math.max(100, Number(e.target.value)))
                        )
                      }
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={100}
                      max={220}
                    />
                    <span className="text-sm text-text-secondary">cm</span>
                  </div>
                </div>

                {/* 체중 */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>체중</span>
                    <span className="tabular-nums text-primary">{weight} kg</span>
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={200}
                    step={1}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) =>
                        setWeight(
                          Math.min(200, Math.max(30, Number(e.target.value)))
                        )
                      }
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={30}
                      max={200}
                    />
                    <span className="text-sm text-text-secondary">kg</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* BMI 값 강조 */}
                <div
                  className="mb-4 rounded-xl border p-5"
                  style={{
                    borderColor: result.color,
                    backgroundColor: result.color + "18",
                  }}
                >
                  <p className="text-xs font-medium text-text-secondary">
                    체질량지수 (BMI)
                  </p>
                  <p
                    className="mt-1 text-5xl font-bold tabular-nums"
                    style={{ color: result.color }}
                  >
                    {result.bmi}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-0.5 text-sm font-semibold text-white"
                      style={{ backgroundColor: result.color }}
                    >
                      {result.category}
                    </span>
                  </div>
                </div>

                {/* 정상 체중 범위 */}
                <div className="mb-5 rounded-lg bg-surface p-4">
                  <p className="text-xs text-text-secondary">
                    정상 체중 범위 (키 {height}cm 기준)
                  </p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                    {result.idealWeightMin} kg ~ {result.idealWeightMax} kg
                  </p>
                </div>

                {/* BMI 게이지 바 */}
                <div>
                  <p className="mb-2 text-sm font-medium text-text-primary">
                    BMI 범위
                  </p>
                  <div className="relative h-6 overflow-visible rounded-full">
                    {/* 색상 세그먼트 */}
                    <div className="flex h-full overflow-hidden rounded-full">
                      {GAUGE_SEGMENTS.map((seg, i) => {
                        const prevMax = i === 0 ? BMI_MIN : GAUGE_SEGMENTS[i - 1].max;
                        const width =
                          ((Math.min(seg.max, BMI_MAX) - prevMax) /
                            (BMI_MAX - BMI_MIN)) *
                          100;
                        return (
                          <div
                            key={seg.label}
                            style={{ width: `${width}%`, backgroundColor: seg.color }}
                          />
                        );
                      })}
                    </div>
                    {/* 현재 위치 마커 */}
                    <div
                      className="absolute -top-1 z-10 h-8 w-1 -translate-x-0.5 rounded-full bg-text-primary shadow-md"
                      style={{ left: `${markerPos}%` }}
                    />
                  </div>
                  {/* 레이블 */}
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                    {GAUGE_SEGMENTS.map((seg) => (
                      <div key={seg.label} className="flex items-center gap-1">
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-xs text-text-secondary">
                          {seg.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* BMI 범위표 */}
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                    {BMI_CATEGORIES.map((cat) => (
                      <div
                        key={cat.label}
                        className={`flex items-center justify-between px-4 py-2.5 ${
                          cat.label === result.category ? "bg-surface" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span
                            className={`text-sm font-medium ${
                              cat.label === result.category
                                ? "text-text-primary"
                                : "text-text-secondary"
                            }`}
                          >
                            {cat.label}
                          </span>
                          {cat.label === result.category && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                              현재
                            </span>
                          )}
                        </div>
                        <span className="tabular-nums text-sm text-text-secondary">
                          {cat.label === "저체중"
                            ? "18.5 미만"
                            : cat.label === "정상"
                            ? "18.5 ~ 22.9"
                            : cat.label === "과체중"
                            ? "23 ~ 24.9"
                            : cat.label === "비만"
                            ? "25 ~ 29.9"
                            : "30 이상"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-text-primary">
                  내 기초대사량이 궁금하다면?
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  성별, 키, 체중, 나이로 하루 기초대사량(BMR)을 계산해보세요.
                </p>
                <Link
                  href="/health/bmr-calculator"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  기초대사량 계산하기
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="BMI 판정 기준 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">BMI란?</strong>
                    <p className="mt-0.5">
                      BMI(Body Mass Index, 체질량지수)는 체중(kg)을 키(m)의 제곱으로
                      나눈 값으로, 비만도를 간접적으로 측정하는 국제 표준 지표입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">대한비만학회 기준</strong>
                    <p className="mt-0.5">
                      한국인의 경우 대한비만학회는 BMI 18.5 미만을 저체중, 18.5~22.9를
                      정상, 23~24.9를 과체중, 25~29.9를 1단계 비만, 30 이상을 2단계
                      이상 비만으로 분류합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">BMI의 한계</strong>
                    <p className="mt-0.5">
                      BMI는 근육량과 체지방을 구분하지 못합니다. 근육이 많은 운동선수는
                      BMI가 높게 나와도 실제로는 건강할 수 있습니다. 정확한 건강 상태는
                      의료 전문가와 상담하시기 바랍니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">계산 공식</strong>
                    <p className="mt-0.5">
                      BMI = 체중(kg) ÷ 키(m)² 예) 키 170cm, 체중 70kg인 경우:
                      70 ÷ (1.7 × 1.7) = 24.2
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="bmi-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Quick summary card */}
              <div
                className="rounded-xl border p-5"
                style={{
                  borderColor: result.color,
                  backgroundColor: result.color + "12",
                }}
              >
                <p className="text-xs font-medium text-text-secondary">내 BMI</p>
                <p
                  className="mt-1 text-4xl font-bold tabular-nums"
                  style={{ color: result.color }}
                >
                  {result.bmi}
                </p>
                <span
                  className="mt-1.5 inline-block rounded-full px-3 py-0.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: result.color }}
                >
                  {result.category}
                </span>
                <div className="mt-3 border-t border-border/50 pt-3 text-sm">
                  <p className="text-text-secondary">
                    정상 체중:{" "}
                    <span className="font-semibold tabular-nums text-text-primary">
                      {result.idealWeightMin} ~ {result.idealWeightMax} kg
                    </span>
                  </p>
                </div>
              </div>

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="BMI 계산기 - Tooly"
                  description={`키 ${height}cm / 체중 ${weight}kg → BMI ${result.bmi} (${result.category})`}
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

export default function BmiCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <BmiCalculatorInner />
    </Suspense>
  );
}
