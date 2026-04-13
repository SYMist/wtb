"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateAge } from "@/lib/calculators/age";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

function AgeCalculatorInner() {
  const searchParams = useSearchParams();

  const [birthDate, setBirthDate] = useState(() => {
    return searchParams.get("birth") ?? "";
  });

  const result = birthDate ? calculateAge(birthDate) : null;

  const calculator = getCalculator("age-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              만 나이 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              생년월일을 입력하면 만 나이와 한국식 나이, 다음 생일까지 남은 일수,
              살아온 일수를 계산합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ── Left: Inputs + Guide ── */}
            <div className="flex-1 space-y-6">
              {/* Input card */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  생년월일 입력
                </h2>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    생년월일
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-text-secondary">
                    오늘 날짜 이전의 날짜를 입력하세요.
                  </p>
                </div>
              </div>

              {/* 만 나이 통일법 안내 */}
              <div className="rounded-xl border border-primary/30 bg-primary-light p-4">
                <p className="text-sm font-semibold text-primary">
                  만 나이 통일법 (2023년 6월 시행)
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  2023년 6월 28일부터 법적·사회적으로 만 나이를 공식 사용합니다.
                  일상 대화에서도 만 나이를 기준으로 말하는 것이 권장됩니다.
                </p>
              </div>

              {/* Results breakdown */}
              {result && (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    나이 상세
                  </h2>
                  <div className="divide-y divide-border">
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          만 나이
                        </p>
                        <p className="text-xs text-text-secondary">
                          국제 표준 / 법적 기준
                        </p>
                      </div>
                      <p className="text-2xl font-bold tabular-nums text-primary">
                        {result.age}세
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          한국식 나이
                        </p>
                        <p className="text-xs text-text-secondary">
                          태어난 해를 1세로 계산
                        </p>
                      </div>
                      <p className="tabular-nums text-base font-semibold text-text-secondary">
                        {result.koreanAge}세 <span className="text-xs font-normal">(참고)</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          다음 생일까지
                        </p>
                        <p className="text-xs text-text-secondary">
                          {result.nextBirthdayDays === 0 ? "오늘이 생일!" : `D-${result.nextBirthdayDays}`}
                        </p>
                      </div>
                      <p className="tabular-nums text-base font-semibold text-text-primary">
                        {result.nextBirthdayDays === 0
                          ? "🎂 오늘!"
                          : `${result.nextBirthdayDays}일`}
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          살아온 일수
                        </p>
                        <p className="text-xs text-text-secondary">
                          생일 포함 오늘까지
                        </p>
                      </div>
                      <p className="tabular-nums text-base font-semibold text-text-primary">
                        {result.totalDays.toLocaleString("ko-KR")}일
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* Guide */}
              <GuideText title="만 나이 vs 한국식 나이">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">만 나이 (국제 표준)</strong>
                    <p className="mt-0.5">
                      태어난 날을 0세로 시작하여, 생일이 지날 때마다 1세씩
                      증가합니다. 전 세계 대부분의 나라에서 사용하는 방식으로,
                      2023년부터 한국도 공식 채택했습니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">한국식 나이 (세는 나이)</strong>
                    <p className="mt-0.5">
                      태어난 해를 1세로 시작하여 매년 1월 1일에 1세씩 증가합니다.
                      일상 대화에서 여전히 사용되기도 하나, 법적·공식 문서에서는
                      만 나이가 기준입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">나이 차이</strong>
                    <p className="mt-0.5">
                      한국식 나이는 만 나이보다 1~2세 많습니다. 생일이 지났으면
                      1세 차이, 생일이 지나지 않았으면 2세 차이가 납니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="age-calculator" />
            </div>

            {/* ── Right: Result sidebar ── */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Main result card */}
              <div
                className={`rounded-xl border p-5 ${
                  result
                    ? "border-primary bg-primary-light"
                    : "border-border bg-background"
                }`}
              >
                <p className="text-xs font-medium text-text-secondary">만 나이</p>
                {result ? (
                  <>
                    <p className="mt-1 text-4xl font-bold tabular-nums text-primary">
                      {result.age}
                      <span className="ml-1 text-xl font-medium">세</span>
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      한국식 나이: {result.koreanAge}세
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-primary/20 pt-4">
                      <div>
                        <p className="text-xs text-text-secondary">다음 생일까지</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.nextBirthdayDays === 0
                            ? "오늘!"
                            : `D-${result.nextBirthdayDays}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">살아온 일수</p>
                        <p className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.totalDays.toLocaleString("ko-KR")}일
                        </p>
                      </div>
                    </div>

                    {result.nextBirthdayDays > 0 && result.nextBirthdayDays <= 30 && (
                      <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                        생일이 {result.nextBirthdayDays}일 남았어요!
                      </div>
                    )}
                    {result.nextBirthdayDays === 0 && (
                      <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
                        오늘 생일을 축하합니다!
                      </div>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-secondary">
                    생년월일을 입력하세요
                  </p>
                )}
              </div>

              {/* Age comparison card */}
              {result && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <h3 className="mb-3 text-sm font-semibold text-text-primary">
                    나이 비교
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">만 나이 (공식)</span>
                      <span className="tabular-nums font-semibold text-primary">
                        {result.age}세
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">한국식 나이</span>
                      <span className="tabular-nums font-medium text-text-secondary">
                        {result.koreanAge}세
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">차이</span>
                      <span className="tabular-nums font-medium text-text-primary">
                        {result.koreanAge - result.age}세
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-text-secondary">
                    2023년 6월부터 법적 기준은 만 나이입니다.
                  </p>
                </div>
              )}

              {/* Share */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="만 나이 계산기 - Tooly"
                  description={
                    result
                      ? `만 ${result.age}세 (한국식 ${result.koreanAge}세) / 살아온 날: ${result.totalDays.toLocaleString("ko-KR")}일`
                      : "만 나이 계산기"
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

export default function AgeCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <AgeCalculatorInner />
    </Suspense>
  );
}
