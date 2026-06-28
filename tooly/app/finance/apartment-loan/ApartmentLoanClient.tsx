"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import InputGroup from "@/components/calculator/InputGroup";
import NumberInput from "@/components/calculator/NumberInput";
import Select from "@/components/calculator/Select";
import { trackEvent } from "@/lib/analytics";
import {
  LOAN_REGULATION,
  LoanInput,
  calculateLoan,
  loanCapForPrice,
  maxLoanForPayment,
} from "@/lib/calculators/apartment-loan";

// 랜딩(본인 실매수 스토리) URL — 점수 계산기와 공유. 확보 시 채우면 보조 링크 노출.
const LANDING_URL = "";
const SCORE_PATH = "/finance/apartment-score";

function won(n: number): string {
  return `₩${Math.round(n).toLocaleString("ko-KR")}`;
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
function eok(n: number): string {
  return `${(n / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억`;
}

export default function ApartmentLoanClient() {
  const [homePrice, setHomePrice] = useState(800_000_000);
  const [seed, setSeed] = useState(200_000_000);
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(0);
  const [grossAnnualIncome, setGrossAnnualIncome] = useState(0);
  const [isDualIncome, setIsDualIncome] = useState(false);
  const [spouseGrossAnnual, setSpouseGrossAnnual] = useState(0);
  const [spouseNetMonthly, setSpouseNetMonthly] = useState(0);
  const [rateStr, setRateStr] = useState("");
  const [years, setYears] = useState(30);
  const [isVariableRate, setIsVariableRate] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const completedRef = useRef(false);
  const adViewedRef = useRef(false);
  const adWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("aptloan_arrival");
  }, []);

  useEffect(() => {
    const el = adWrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !adViewedRef.current) {
            adViewedRef.current = true;
            trackEvent("aptloan_bridge_adsense_view");
            ob.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const resetSubmit = useCallback(() => setSubmitted(false), []);

  const onNum = useCallback(
    (setter: (v: number) => void) => (v: number) => {
      resetSubmit();
      setter(v);
    },
    [resetSubmit]
  );

  const annualRatePct = parseFloat(rateStr) || 0;
  const totalGrossAnnual = isDualIncome ? grossAnnualIncome + spouseGrossAnnual : grossAnnualIncome;
  const totalNetMonthly = isDualIncome ? netMonthlyIncome + spouseNetMonthly : netMonthlyIncome;
  const ready =
    homePrice > 0 && years > 0 && annualRatePct > 0 && totalGrossAnnual > 0;

  const input: LoanInput = {
    homePrice,
    seed,
    netMonthlyIncome: totalNetMonthly,
    grossAnnualIncome: totalGrossAnnual,
    annualRatePct,
    years,
    isVariableRate,
    isFirstTime,
  };
  const result = calculateLoan(input);
  const judgmentRate = isVariableRate
    ? annualRatePct + LOAN_REGULATION.stressRateDefault * 100
    : annualRatePct;
  const judgmentDsr = isVariableRate ? result.stressedDsr : result.dsr;

  // 불가 시 "목돈 얼마면 가능" 힌트
  const maxLoanByLtv = Math.min(
    homePrice * LOAN_REGULATION.ltvFirstTime,
    loanCapForPrice(homePrice)
  );
  const maxPaymentByDsr = (totalGrossAnnual * LOAN_REGULATION.dsrLimit) / 12;
  const maxLoanByDsr = maxLoanForPayment(maxPaymentByDsr, judgmentRate, years);
  const maxLoan = Math.min(maxLoanByLtv, maxLoanByDsr);
  const requiredSeed = Math.max(homePrice - maxLoan, 0);
  const extraSeedNeeded = Math.max(requiredSeed - seed, 0);

  const ltvCapPctLabel = `${Math.round(result.ltvCap * 100)}%`;
  const dsrCapPctLabel = `${Math.round(LOAN_REGULATION.dsrLimit * 100)}%`;

  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          아파트 대출 감당 시뮬레이터
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          집값·목돈·소득·금리를 넣으면 월 원리금과 LTV·DSR을 계산해{" "}
          <strong>대출 감당 가능 여부</strong>를 판정합니다. ({LOAN_REGULATION.asOf}{" "}
          규제 기준)
        </p>

        <AdSlot type="banner" />

        <div className="mt-4 flex flex-col gap-6 lg:flex-row">
          {/* 입력 폼 */}
          <div className="w-full space-y-4 lg:w-1/2">
            {/* 🔴 신뢰 카피 (약한 고리 #3) */}
            <div className="flex items-start gap-2 rounded-lg border border-positive/30 bg-positive-light px-3 py-2.5 text-xs leading-relaxed text-text-primary">
              <span aria-hidden>🔒</span>
              <span>
                입력값은 <strong>당신 기기 밖으로 절대 나가지 않습니다</strong>{" "}
                (서버 전송 없음). 소득·자산을 안심하고 넣으세요.
              </span>
            </div>

            <InputGroup title="집과 자금">
              <NumberInput
                label="타겟 집 가격"
                value={homePrice}
                onChange={onNum(setHomePrice)}
                max={10_000_000_000}
                unit="원"
              />
              <NumberInput
                label="보유 목돈 (시드)"
                value={seed}
                onChange={onNum(setSeed)}
                max={10_000_000_000}
                unit="원"
              />
              <p className="-mt-1 text-xs text-text-secondary">
                필요 대출금 = 집값 − 시드 ={" "}
                <strong className="text-text-primary">
                  {won(result.loanAmount)}
                </strong>
              </p>
            </InputGroup>

            <InputGroup title="소득">
              <NumberInput
                label={isDualIncome ? "본인 세전 연소득 (DSR 판정용)" : "세전 연소득 (DSR 판정용)"}
                value={grossAnnualIncome}
                onChange={onNum(setGrossAnnualIncome)}
                max={2_000_000_000}
                unit="원"
              />
              <NumberInput
                label={isDualIncome ? "본인 세후 월소득 (체감 부담률, 선택)" : "세후 월소득 (체감 부담률 표시용, 선택)"}
                value={netMonthlyIncome}
                onChange={onNum(setNetMonthlyIncome)}
                max={200_000_000}
                unit="원"
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text-primary">
                <input
                  type="checkbox"
                  checked={isDualIncome}
                  onChange={(e) => {
                    resetSubmit();
                    setIsDualIncome(e.target.checked);
                    if (!e.target.checked) {
                      setSpouseGrossAnnual(0);
                      setSpouseNetMonthly(0);
                    }
                  }}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                맞벌이예요 — 배우자 소득 추가
              </label>
              {isDualIncome && (
                <>
                  <NumberInput
                    label="배우자 세전 연소득"
                    value={spouseGrossAnnual}
                    onChange={onNum(setSpouseGrossAnnual)}
                    max={2_000_000_000}
                    unit="원"
                  />
                  <NumberInput
                    label="배우자 세후 월소득 (선택)"
                    value={spouseNetMonthly}
                    onChange={onNum(setSpouseNetMonthly)}
                    max={200_000_000}
                    unit="원"
                  />
                </>
              )}
            </InputGroup>

            <InputGroup title="대출 조건">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  연 금리 (%)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rateStr}
                  onChange={(e) => {
                    resetSubmit();
                    setRateStr(e.target.value.replace(/[^0-9.]/g, ""));
                  }}
                  placeholder="예: 4.2"
                  className="tabular-nums w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary"
                />
                <p className="mt-1 text-xs text-text-secondary">
                  실제 받을 금리를 직접 넣으세요. (예시일 뿐 자동 적용 안 함)
                </p>
              </div>
              <NumberInput
                label="상환기간 (년)"
                value={years}
                onChange={onNum(setYears)}
                max={50}
                unit="년"
              />
              <Select
                label="금리 유형"
                value={isVariableRate ? "variable" : "fixed"}
                onChange={(v) => {
                  resetSubmit();
                  setIsVariableRate(v === "variable");
                }}
                options={[
                  { value: "fixed", label: "고정금리" },
                  { value: "variable", label: "변동금리 (스트레스 DSR 가산)" },
                ]}
              />
              <Select
                label="생애최초 주택구입"
                value={isFirstTime ? "yes" : "no"}
                onChange={(v) => {
                  resetSubmit();
                  setIsFirstTime(v === "yes");
                }}
                options={[
                  { value: "yes", label: "예 (LTV 70% 기준)" },
                  { value: "no", label: "아니오" },
                ]}
              />
            </InputGroup>

            <button
              type="button"
              disabled={!ready}
              onClick={() => {
                setSubmitted(true);
                if (!completedRef.current) {
                  completedRef.current = true;
                  trackEvent("aptloan_complete", { dual_income: isDualIncome });
                }
              }}
              className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                ready
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "cursor-not-allowed bg-border text-text-secondary"
              }`}
            >
              {submitted ? "결과 다시 보기" : "결과 보기"}
            </button>
          </div>

          {/* 결과 패널 */}
          <div className="w-full lg:w-1/2">
            <div className="lg:sticky lg:top-20">
              {!(ready && submitted) ? (
                <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-secondary">
                  {ready
                    ? "완료를 누르면 판정 결과를 보여드려요."
                    : "집값·소득·금리를 입력해주세요."}
                </div>
              ) : (
                <>
                  {/* 판정 */}
                  <div
                    className={`rounded-xl border p-5 ${
                      result.affordable
                        ? "border-positive/40 bg-positive-light"
                        : "border-negative/40 bg-negative-light"
                    }`}
                  >
                    <div className="text-sm text-text-secondary">최종 판정</div>
                    <div
                      className={`mt-1 text-3xl font-bold ${
                        result.affordable ? "text-positive" : "text-negative"
                      }`}
                    >
                      {result.affordable ? "감당 가능" : "감당 어려움"}
                    </div>
                    <p className="mt-1 text-sm text-text-primary">
                      {result.affordable
                        ? "LTV·DSR 한도를 모두 통과했어요."
                        : `${!result.ltvOk ? "LTV" : ""}${
                            !result.ltvOk && !result.dsrOk ? "·" : ""
                          }${!result.dsrOk ? "DSR" : ""} 한도를 넘었어요.`}
                    </p>
                  </div>

                  {/* 분해 */}
                  <div className="mt-3 space-y-4 rounded-xl border border-border p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-text-secondary">
                        월 원리금
                      </span>
                      <span className="tabular-nums text-lg font-bold text-text-primary">
                        {won(result.monthlyPayment)}
                      </span>
                    </div>
                    {totalNetMonthly > 0 && (
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-text-secondary">
                          세후소득 비중
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {pct(result.netIncomeShare)}
                        </span>
                      </div>
                    )}

                    {/* LTV 게이지 */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-text-secondary">
                          LTV (한도 {ltvCapPctLabel})
                        </span>
                        <span
                          className={`tabular-nums font-semibold ${
                            result.ltvOk ? "text-positive" : "text-negative"
                          }`}
                        >
                          {pct(result.ltvRatio)} {result.ltvOk ? "✓" : "✗"}
                        </span>
                      </div>
                      <Gauge value={result.ltvRatio} limit={result.ltvCap} ok={result.ltvOk} />
                      {result.loanAmount > result.loanCapAmount && (
                        <p className="mt-1 text-xs text-negative">
                          대출금이 차등 한도({eok(result.loanCapAmount)})를 초과했어요.
                        </p>
                      )}
                    </div>

                    {/* DSR 게이지 */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-text-secondary">
                          DSR (한도 {dsrCapPctLabel})
                        </span>
                        <span
                          className={`tabular-nums font-semibold ${
                            result.dsrOk ? "text-positive" : "text-negative"
                          }`}
                        >
                          {pct(judgmentDsr)} {result.dsrOk ? "✓" : "✗"}
                        </span>
                      </div>
                      <Gauge value={judgmentDsr} limit={LOAN_REGULATION.dsrLimit} ok={result.dsrOk} />
                      {isVariableRate && (
                        <p className="mt-1 text-xs text-text-secondary">
                          변동금리라 2026 스트레스 DSR 3단계 기준{" "}
                          {LOAN_REGULATION.stressRateDefault * 100}%p 가산해
                          판정했어요. (기본 DSR {pct(result.dsr)})
                        </p>
                      )}
                    </div>

                    {/* 불가 시 힌트 */}
                    {!result.affordable && extraSeedNeeded > 0 && (
                      <div className="rounded-lg bg-surface px-3 py-2.5 text-xs text-text-primary">
                        목돈이 약{" "}
                        <strong>{won(extraSeedNeeded)}</strong> 더 있으면(또는
                        집값을 그만큼 낮추면) 한도 안으로 들어와요.
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 나가는 다리 */}
              <div className="mt-3 space-y-2">
                <Link
                  href={SCORE_PATH}
                  onClick={() => trackEvent("aptloan_bridge_score", { dual_income: isDualIncome })}
                  className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  이 집, 점수도 매겨보기 →
                </Link>
                {LANDING_URL && (
                  <a
                    href={LANDING_URL}
                    onClick={() => trackEvent("aptloan_bridge_landing", { dual_income: isDualIncome })}
                    className="block text-center text-sm text-primary underline"
                  >
                    이 기준을 만든 사람의 실제 매수 사례 보기 →
                  </a>
                )}
              </div>

              {/* 애드센스 다리 */}
              <div ref={adWrapRef}>
                <AdSlot type="inline" className="mt-4" />
              </div>

              {isDualIncome && (
                <p className="mt-3 text-[11px] leading-relaxed text-amber-600">
                  부부 합산은 공동대출(공동명의·생활안정자금 등) 기준입니다.
                  단독대출이면 차주(명의자) 소득만 인정될 수 있어요.
                </p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-text-secondary">
                {LOAN_REGULATION.asOf} 규제 기준(생애최초·무주택 LTV{" "}
                {ltvCapPctLabel}, DSR {dsrCapPctLabel}, 수도권 차등한도). 다주택·지역별
                LTV 분기와 은행별 정밀 스트레스 가산은 미반영이며, 실제 한도는
                금융기관·정책에 따라 달라질 수 있어요.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Gauge({
  value,
  limit,
  ok,
}: {
  value: number;
  limit: number;
  ok: boolean;
}) {
  // 한도를 막대의 80% 지점에 두고, 값은 한도 대비 비율로 채움(시각적 여유)
  const fill = Math.min((value / limit) * 80, 100);
  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full rounded-full ${ok ? "bg-positive" : "bg-negative"}`}
        style={{ width: `${fill}%` }}
      />
      {/* 한도 마커 (80% 지점) */}
      <div
        className="absolute top-0 h-full w-0.5 bg-text-secondary/60"
        style={{ left: "80%" }}
      />
    </div>
  );
}
