"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { calculateBmr, type Gender } from "@/lib/calculators/bmr";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

function BmrCalculatorInner() {
  const searchParams = useSearchParams();

  const [gender, setGender] = useState<Gender>(() => {
    const v = searchParams.get("gender");
    return v === "female" ? "female" : "male";
  });
  const [height, setHeight] = useState(() => {
    const v = searchParams.get("height");
    return v ? Number(v) : 170;
  });
  const [weight, setWeight] = useState(() => {
    const v = searchParams.get("weight");
    return v ? Number(v) : 70;
  });
  const [age, setAge] = useState(() => {
    const v = searchParams.get("age");
    return v ? Number(v) : 30;
  });

  const result = useMemo(
    () => calculateBmr(gender, height, weight, age),
    [gender, height, weight, age]
  );

  const calculator = getCalculator("bmr-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              기초대사량 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              성별, 키, 체중, 나이를 입력하면 하루 기초대사량(BMR)을 즉시 계산합니다.
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

                {/* 성별 토글 */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    성별
                  </label>
                  <div className="flex overflow-hidden rounded-lg border border-border">
                    {(["male", "female"] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          gender === g
                            ? "bg-primary text-white"
                            : "bg-background text-text-secondary hover:bg-surface"
                        }`}
                      >
                        {g === "male" ? "남성" : "여성"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 키 */}
                <div className="mb-5">
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
                <div className="mb-5">
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

                {/* 나이 */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>나이</span>
                    <span className="tabular-nums text-primary">{age}세</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) =>
                        setAge(
                          Math.min(100, Math.max(10, Number(e.target.value)))
                        )
                      }
                      className="w-24 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      min={10}
                      max={100}
                    />
                    <span className="text-sm text-text-secondary">세</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* BMR 강조 */}
                <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                  <p className="text-xs font-medium text-text-secondary">
                    기초대사량 (BMR)
                  </p>
                  <p className="mt-1 text-5xl font-bold tabular-nums text-primary">
                    {result.bmr.toLocaleString("ko-KR")}
                    <span className="ml-1 text-2xl font-medium">kcal</span>
                  </p>
                  <p className="mt-2 text-xs text-text-secondary">
                    사용 공식:{" "}
                    <span className="font-medium text-text-primary">
                      {result.formula}
                    </span>
                  </p>
                </div>

                {/* 보조 정보 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">성별</p>
                    <p className="mt-1 text-base font-semibold text-text-primary">
                      {gender === "male" ? "남성" : "여성"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">나이</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                      {age}세
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">키</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                      {height} cm
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface p-4">
                    <p className="text-xs text-text-secondary">체중</p>
                    <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                      {weight} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-text-primary">
                  하루 필요 칼로리가 궁금하다면?
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  활동 수준을 반영한 일일 권장 칼로리(감량·유지·증량)를 계산해보세요.
                </p>
                <Link
                  href="/health/calorie-calculator"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  칼로리 계산하기
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
              <GuideText title="기초대사량(BMR) 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">기초대사량이란?</strong>
                    <p className="mt-0.5">
                      기초대사량(Basal Metabolic Rate, BMR)은 아무 활동도 하지 않고
                      생명을 유지하는 데 필요한 최소한의 에너지입니다. 호흡, 체온
                      유지, 장기 활동 등 기본적인 생리 기능에 소모됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">Mifflin-St Jeor 공식</strong>
                    <p className="mt-0.5">
                      이 계산기는 현재 가장 정확하다고 알려진 Mifflin-St Jeor 공식을
                      사용합니다.
                    </p>
                    <p className="mt-1 font-mono text-xs">
                      남성: (10 × 체중) + (6.25 × 키) - (5 × 나이) + 5
                    </p>
                    <p className="font-mono text-xs">
                      여성: (10 × 체중) + (6.25 × 키) - (5 × 나이) - 161
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">기초대사량에 영향을 미치는 요인</strong>
                    <p className="mt-0.5">
                      근육량이 많을수록 기초대사량이 높아집니다. 나이가 들수록
                      근육량이 줄어 기초대사량도 감소합니다. 남성은 여성보다 근육량이
                      많아 일반적으로 기초대사량이 더 높습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활용 방법</strong>
                    <p className="mt-0.5">
                      기초대사량은 식단 계획의 기준이 됩니다. 기초대사량보다 적게
                      섭취하면 체중 감량이 가능하지만, 과도하게 적게 먹으면 근손실과
                      건강 문제가 생길 수 있습니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="bmr-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Summary card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  기초대사량 (BMR)
                </p>
                <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                  {result.bmr.toLocaleString("ko-KR")}
                </p>
                <p className="mt-0.5 text-sm text-primary">kcal/일</p>
                <div className="mt-3 space-y-1.5 border-t border-primary/20 pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">공식</span>
                    <span className="font-medium text-text-primary">
                      {result.formula}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">성별</span>
                    <span className="font-medium text-text-primary">
                      {gender === "male" ? "남성" : "여성"}
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
                  title="기초대사량 계산기 - Tooly"
                  description={`${gender === "male" ? "남성" : "여성"} / 키 ${height}cm / 체중 ${weight}kg / ${age}세 → 기초대사량 ${result.bmr.toLocaleString("ko-KR")} kcal`}
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

export default function BmrCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <BmrCalculatorInner />
    </Suspense>
  );
}
