"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { calculateCalorie, activityLevels, type ActivityLevel } from "@/lib/calculators/calorie";
import { calculateBmr, type Gender } from "@/lib/calculators/bmr";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function CalorieCalculatorInner() {
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
  const [activity, setActivity] = useState<ActivityLevel>(() => {
    const v = searchParams.get("activity");
    return (v as ActivityLevel) || "moderate";
  });

  const bmrResult = useMemo(
    () => calculateBmr(gender, height, weight, age),
    [gender, height, weight, age]
  );

  const calorieResult = useMemo(
    () => calculateCalorie(bmrResult.bmr, activity),
    [bmrResult.bmr, activity]
  );

  const calculator = getCalculator("calorie-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              칼로리 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              신체 정보와 활동 수준을 입력하면 목적별 일일 권장 칼로리를 즉시 계산합니다.
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
                <div className="mb-5">
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

                {/* 활동 수준 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    활동 수준
                  </label>
                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <label
                        key={level.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                          activity === level.value
                            ? "border-primary bg-primary-light"
                            : "border-border hover:border-primary/50 hover:bg-surface"
                        }`}
                      >
                        <input
                          type="radio"
                          name="activity"
                          value={level.value}
                          checked={activity === level.value}
                          onChange={() => setActivity(level.value)}
                          className="accent-primary"
                        />
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              activity === level.value
                                ? "text-primary"
                                : "text-text-primary"
                            }`}
                          >
                            {level.label}
                          </p>
                          <p className="text-xs text-text-secondary">
                            활동계수 ×{level.factor}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* BMR 참고 */}
              <div className="rounded-lg border border-border bg-surface px-4 py-3">
                <p className="text-xs text-text-secondary">
                  계산에 사용된 기초대사량 (BMR)
                </p>
                <p className="mt-0.5 text-base font-semibold tabular-nums text-text-primary">
                  {fmt(bmrResult.bmr)}{" "}
                  <span className="text-sm font-normal text-text-secondary">
                    kcal/일
                  </span>
                </p>
              </div>

              {/* Results: 3 cards */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  일일 권장 칼로리
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* 감량 */}
                  <div className="rounded-xl border border-negative/30 bg-negative-light p-4 text-center">
                    <p className="text-xs font-medium text-negative">감량</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-negative">
                      {fmt(calorieResult.loss)}
                    </p>
                    <p className="text-sm font-medium text-negative">kcal</p>
                    <p className="mt-2 text-xs text-text-secondary">
                      유지 대비 -500 kcal
                    </p>
                  </div>

                  {/* 유지 */}
                  <div className="rounded-xl border border-primary bg-primary-light p-4 text-center">
                    <p className="text-xs font-medium text-primary">유지</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {fmt(calorieResult.maintenance)}
                    </p>
                    <p className="text-sm font-medium text-primary">kcal</p>
                    <p className="mt-2 text-xs text-text-secondary">
                      현재 체중 유지
                    </p>
                  </div>

                  {/* 증량 */}
                  <div className="rounded-xl border border-positive/30 bg-positive-light p-4 text-center">
                    <p className="text-xs font-medium text-positive">증량</p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-positive">
                      {fmt(calorieResult.gain)}
                    </p>
                    <p className="text-sm font-medium text-positive">kcal</p>
                    <p className="mt-2 text-xs text-text-secondary">
                      유지 대비 +500 kcal
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-text-primary">
                  내 BMI도 확인해보세요
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  키와 체중으로 체질량지수(BMI)와 비만도를 확인해보세요.
                </p>
                <Link
                  href="/health/bmi-calculator"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
                >
                  BMI 계산하기
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
              <GuideText title="활동 수준 및 칼로리 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">일일 권장 칼로리란?</strong>
                    <p className="mt-0.5">
                      기초대사량(BMR)에 활동계수를 곱하여 산출한 하루에 필요한
                      총 칼로리(TDEE, Total Daily Energy Expenditure)입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">활동 수준별 기준</strong>
                    <ul className="mt-0.5 space-y-1">
                      <li>
                        <span className="font-medium">비활동적 (×1.2)</span>: 하루 대부분
                        앉아서 생활하고 별도 운동이 없는 경우
                      </li>
                      <li>
                        <span className="font-medium">가벼운 활동 (×1.375)</span>: 주 1~3회
                        가벼운 운동 또는 산책
                      </li>
                      <li>
                        <span className="font-medium">보통 활동 (×1.55)</span>: 주 3~5회
                        중강도 운동
                      </li>
                      <li>
                        <span className="font-medium">활동적 (×1.725)</span>: 주 6~7회
                        고강도 운동
                      </li>
                      <li>
                        <span className="font-medium">매우 활동적 (×1.9)</span>: 운동선수
                        수준의 하루 2회 이상 훈련
                      </li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-text-primary">감량과 증량</strong>
                    <p className="mt-0.5">
                      1kg의 체지방은 약 7,700kcal에 해당합니다. 하루 500kcal를
                      줄이면 이론상 주 1회 0.45kg 감량이 가능합니다. 단, 과도한
                      칼로리 제한은 근손실과 건강 문제를 유발할 수 있으므로
                      전문가와 상담하시기 바랍니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="calorie-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Summary card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  유지 칼로리
                </p>
                <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                  {fmt(calorieResult.maintenance)}
                </p>
                <p className="text-sm text-primary">kcal/일</p>
                <div className="mt-3 space-y-2 border-t border-primary/20 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-negative font-medium">감량</span>
                    <span className="tabular-nums font-semibold text-negative">
                      {fmt(calorieResult.loss)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-positive font-medium">증량</span>
                    <span className="tabular-nums font-semibold text-positive">
                      {fmt(calorieResult.gain)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-primary/20 pt-2 text-sm">
                    <span className="text-text-secondary">기초대사량</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(bmrResult.bmr)} kcal
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
                  title="칼로리 계산기 - Tooly"
                  description={`${gender === "male" ? "남성" : "여성"} / 키 ${height}cm / 체중 ${weight}kg / ${age}세 / ${activityLevels.find((a) => a.value === activity)?.label} → 유지 ${fmt(calorieResult.maintenance)} kcal`}
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

export default function CalorieCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <CalorieCalculatorInner />
    </Suspense>
  );
}
