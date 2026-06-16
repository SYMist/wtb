"use client";

import { useState, useMemo } from "react";

import { calculateSeverance } from "@/lib/calculators/severance";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

export interface SeveranceCalculatorClientProps {
  initialStart: string;
  initialEnd: string;
  initialPay: number;
}

export default function SeveranceCalculatorClient({
  initialStart,
  initialEnd,
  initialPay,
}: SeveranceCalculatorClientProps) {
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [monthlyPay, setMonthlyPay] = useState(initialPay);

  const result = useMemo(() => {
    // Guard: end must be after start
    if (new Date(endDate) <= new Date(startDate)) return null;
    return calculateSeverance({
      startDate,
      endDate,
      recentMonthlyPay: monthlyPay,
    });
  }, [startDate, endDate, monthlyPay]);

  const isEligible = result !== null && result.totalDays >= 365;

  const calculator = getCalculator("severance-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              퇴직금 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              입사일과 퇴사일, 월평균 급여를 입력하면 예상 퇴직금을 즉시
              계산합니다.
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
                  근무 정보 입력
                </h2>

                {/* 입사일 */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    입사일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                {/* 퇴사일 */}
                <div className="mb-5">
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    퇴사일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>

                {/* 월평균급여 */}
                <div className="mb-0">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>최근 3개월 월평균 급여</span>
                    <span className="tabular-nums text-primary">
                      {fmt(monthlyPay)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={monthlyPay}
                      onChange={(e) =>
                        setMonthlyPay(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={100_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-text-secondary">
                    기본급, 고정 수당 등 정기적으로 지급된 금액의 평균을
                    입력하세요.
                  </p>
                </div>
              </div>

              {/* Results */}
              {result === null ? (
                <div className="rounded-xl border border-border bg-surface p-5 text-center text-sm text-text-secondary">
                  퇴사일이 입사일보다 이후여야 합니다.
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    계산 결과
                  </h2>

                  {/* Eligibility notice */}
                  {!isEligible ? (
                    <div className="mb-4 rounded-lg bg-negative-light px-4 py-3 text-sm text-negative">
                      퇴직금은 계속 근로기간이 1년(365일) 이상인 경우에만
                      지급됩니다. 현재 근속기간은{" "}
                      <span className="font-semibold tabular-nums">
                        {result.totalDays}일
                      </span>
                      입니다.
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg bg-positive-light px-4 py-3 text-sm text-positive">
                      퇴직금 수급 요건을 충족합니다.
                    </div>
                  )}

                  {/* 세후 실수령액 highlight */}
                  <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                    <p className="text-xs font-medium text-text-secondary">
                      세후 실수령액
                    </p>
                    <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                      {fmt(Math.max(result.netSeverancePay, 0))}
                      <span className="ml-1 text-lg font-medium">원</span>
                    </p>
                    {!isEligible && (
                      <p className="mt-1 text-xs text-text-secondary">
                        1년 미만 근무로 실제 지급 대상이 아닙니다.
                      </p>
                    )}
                  </div>

                  {/* 세금 내역 */}
                  <div className="mb-4 divide-y divide-border rounded-xl border border-border bg-surface">
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">세전 퇴직금</span>
                      <span className="tabular-nums text-sm font-medium text-text-primary">
                        {fmt(result.severancePay)}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        퇴직소득세
                        <span className="ml-1.5 text-xs text-text-secondary">
                          (근속 {result.yearsRounded}년 기준)
                        </span>
                      </span>
                      <span className="tabular-nums text-sm text-negative">
                        −{fmt(result.retirementTax)}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        지방소득세
                        <span className="ml-1.5 text-xs text-text-secondary">(퇴직소득세 × 10%)</span>
                      </span>
                      <span className="tabular-nums text-sm text-negative">
                        −{fmt(result.localTax)}원
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm font-semibold text-text-primary">세후 실수령액</span>
                      <span className="tabular-nums text-sm font-bold text-primary">
                        {fmt(Math.max(result.netSeverancePay, 0))}원
                      </span>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">근속기간</p>
                      <p className="mt-1 text-base font-semibold text-text-primary">
                        {result.years > 0 && (
                          <span className="tabular-nums">{result.years}년 </span>
                        )}
                        {result.months > 0 && (
                          <span className="tabular-nums">
                            {result.months}개월{" "}
                          </span>
                        )}
                        <span className="tabular-nums">{result.days}일</span>
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-text-secondary">
                        (총 {result.totalDays.toLocaleString("ko-KR")}일)
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">1일 평균임금</p>
                      <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                        {fmt(result.dailyWage)}원
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        월급 × 3 ÷ 91일
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-xs text-text-secondary">근속연수공제</p>
                      <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                        {fmt(result.serviceYearDeduction)}원
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        소득세법 제48조
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* 시나리오 가이드 — 항상 노출 (SEO 본문) */}
              <article className="space-y-6 rounded-xl border border-border bg-background p-5 sm:p-6">
                <header>
                  <h2 className="text-lg font-bold text-text-primary">
                    퇴직금과 퇴직소득세, 상황별로 정확히 이해하기
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    같은 퇴직금이라도 근속연수가 길면 세금이 급감하고, 중간정산
                    이력이나 퇴직연금 유형(DB·DC)에 따라 실수령액이 달라집니다.
                    핵심 시나리오를 짚어 드립니다.
                  </p>
                </header>

                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    1. 퇴직금은 이 순서로 계산됩니다
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    퇴직금은 <strong className="text-text-primary">1일 평균임금 × 30일 × (계속 근로기간 ÷ 365)</strong>로
                    계산합니다. 여기서 1일 평균임금은 퇴직 직전 3개월간 받은
                    임금 총액을 그 기간의 일수(보통 91일)로 나눈 값이에요.
                    월급만 12로 나누는 게 아니라, 정기 상여금·연차수당까지
                    3개월 임금에 반영되기 때문에 단순 월급 기준보다 평균임금이
                    높아지는 경우가 많습니다. 평균임금이 통상임금보다 낮으면
                    근로자 보호를 위해 통상임금으로 계산합니다.
                  </p>
                </section>

                <section className="space-y-2 rounded-lg border border-primary/30 bg-primary-light/50 p-4">
                  <h3 className="text-base font-semibold text-text-primary">
                    2. 퇴직소득세 구조 — 단순 계산기가 가장 많이 틀리는 부분
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    퇴직소득세는 근로소득세처럼 단순히 세율을 곱하지 않습니다.
                    <strong className="text-text-primary"> 연분연승(年分年乘)</strong> 구조라
                    근속연수가 길수록 세금이 크게 줄어드는 게 핵심이에요. 순서는:
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    ① <strong className="text-text-primary">근속연수공제</strong> 차감 →
                    ② <strong className="text-text-primary">환산급여</strong> 산출(퇴직소득금액 × 12 ÷ 근속연수) →
                    ③ <strong className="text-text-primary">환산급여공제</strong> 차감 →
                    ④ 기본세율(6~45%) 적용 →
                    ⑤ 산출세액 × 근속연수 ÷ 12.
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    ②④⑤에서 근속연수로 나눴다가 다시 곱하는 &lsquo;연분연승&rsquo;
                    때문에, 같은 금액이라도 오래 일하고 받은 퇴직금일수록
                    실효세율이 뚝 떨어집니다. 월급에 세율만 곱해 어림하면 실제와
                    크게 어긋나요.
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-base font-semibold text-text-primary">
                    3. 근속연수별 세금 급감 — 같은 3천만원이라도
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    퇴직금이 똑같이 3,000만원이어도 근속연수에 따라 퇴직소득세가
                    이렇게 달라집니다.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-text-secondary">
                          <th className="py-2 pr-3 font-medium">근속연수</th>
                          <th className="py-2 pr-3 font-medium">근속연수공제</th>
                          <th className="py-2 font-medium">총 세금(지방세 포함)</th>
                        </tr>
                      </thead>
                      <tbody className="text-text-primary">
                        <tr className="border-b border-border/60">
                          <td className="py-2 pr-3">3년</td>
                          <td className="py-2 pr-3">300만원</td>
                          <td className="py-2">약 137만원</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3">12년</td>
                          <td className="py-2 pr-3">2,000만원</td>
                          <td className="py-2">약 5만원</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    근속 12년이면 근속연수공제(2,000만원)만으로도 과세표준이
                    거의 사라져 세금이 5만원 수준이에요. 오래 근무할수록 퇴직금
                    세 부담이 급격히 낮아지는 이유입니다.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    4. 중간정산·중도퇴사 정산은 어떻게
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    무주택자 주택 구입, 전세보증금, 6개월 이상 요양 등 법정 사유로
                    <strong className="text-text-primary"> 중간정산</strong>을 받았다면, 그 시점에
                    근속연수가 리셋되어 이후 퇴직 시 근속연수가 짧게 잡힙니다.
                    근속연수가 짧으면 위 표처럼 세 부담이 커질 수 있으니, 중간정산
                    이력이 있으면 정산 시점 이후 기간만으로 계산해야 정확해요.
                    중도퇴사도 마지막 재직분에 대해 같은 방식으로 정산합니다.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    5. DB형 vs DC형 — 퇴직연금이면 금액이 달라진다
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    퇴직연금에 가입돼 있다면 유형에 따라 수령액이 달라집니다.
                    <strong className="text-text-primary"> DB형(확정급여)</strong>은 이 계산기처럼
                    &lsquo;퇴직 직전 평균임금 × 근속연수&rsquo;로 사실상 법정 퇴직금과
                    같습니다. 반면 <strong className="text-text-primary">DC형(확정기여)</strong>은
                    회사가 매년 연봉의 1/12을 적립하고 그 운용 수익이 더해지는
                    구조라, 운용 성과에 따라 법정 퇴직금보다 많을 수도 적을 수도
                    있어요. 이 계산기 결과는 <strong className="text-text-primary">법정 퇴직금·DB형
                    기준</strong> 추정치로 보시면 됩니다.
                  </p>
                </section>
              </article>

              {/* Guide */}
              <GuideText title="퇴직금 계산 공식 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">퇴직금 계산 공식</strong>
                    <p className="mt-0.5">
                      퇴직금 = 1일 평균임금 × 30일 × (계속 근로기간 ÷ 365)
                      <br />
                      1일 평균임금 = 최근 3개월 급여 총액 ÷ 해당 일수(약 91일)
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">수급 요건</strong>
                    <p className="mt-0.5">
                      계속 근로기간이 1년 이상이고 주 소정 근로시간이 15시간
                      이상인 근로자에게 퇴직 시 지급합니다. 근로자퇴직급여
                      보장법에 따라 사용자는 의무적으로 퇴직금을 지급해야
                      합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">평균임금에 포함되는 항목</strong>
                    <p className="mt-0.5">
                      기본급, 각종 고정 수당(직책수당, 직무수당 등), 식대
                      (비과세 한도 초과분), 상여금(최근 3개월분), 연차수당
                      등이 포함됩니다. 실비변상 성격의 금품은 제외됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">퇴직소득세 계산 방법</strong>
                    <p className="mt-0.5">
                      ① 근속연수공제 차감 → ② 환산급여 산출(× 12 ÷ 근속연수) →
                      ③ 환산급여공제 차감 → ④ 세율 적용(6~45%) → ⑤ 산출세액(×
                      근속연수 ÷ 12). 근속연수가 길수록 공제가 커져 실효세율이
                      낮아집니다. 지방소득세는 퇴직소득세의 10%가 추가됩니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="severance-calculator" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {result && (
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="mb-3 text-xs font-medium text-text-secondary">
                    결과 공유하기
                  </p>
                  <ShareButton
                    title="퇴직금 계산기 - Tooly"
                    description={`근속 ${result.years}년 ${result.months}개월 / 월평균 ${fmt(monthlyPay)}원 → 세후 실수령액 ${fmt(Math.max(result.netSeverancePay, 0))}원`}
                  />
                </div>
              )}

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
