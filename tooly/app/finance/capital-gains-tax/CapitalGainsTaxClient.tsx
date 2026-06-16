"use client";

import { useState, useMemo, useEffect } from "react";

import { calculateCapitalGainsTax } from "@/lib/calculators/capital-gains-tax";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");
const fmtEok = (n: number) => (n / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 2 });

export default function CapitalGainsTaxClient() {
  const [acquisitionPrice, setAcquisitionPrice] = useState(500_000_000);
  const [sellingPrice, setSellingPrice] = useState(800_000_000);
  const [holdingYears, setHoldingYears] = useState(5);
  const [residenceYears, setResidenceYears] = useState(5);
  const [isSingleHome, setIsSingleHome] = useState(false);
  const [expenses, setExpenses] = useState(0);

  // 딥링크(?acq=&sell=&years=&live=&single=&exp=) 프리셋을 마운트 후 적용.
  // 서버는 기본값으로 정적 프리렌더되고, URL 파라미터는 클라이언트에서만 반영(no-store 제거).
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- 브라우저 전용 URL 딥링크를 마운트 후 1회 반영(의도적). 정적 프리렌더 유지 목적. */
    const sp = new URLSearchParams(window.location.search);
    const num = (k: string, set: (n: number) => void) => {
      const v = sp.get(k);
      if (v !== null && v !== "" && !isNaN(Number(v))) set(Number(v));
    };
    num("acq", setAcquisitionPrice);
    num("sell", setSellingPrice);
    num("years", setHoldingYears);
    num("live", setResidenceYears);
    num("exp", setExpenses);
    if (sp.get("single") === "true") setIsSingleHome(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const result = useMemo(
    () =>
      calculateCapitalGainsTax({
        acquisitionPrice,
        sellingPrice,
        holdingYears,
        residenceYears,
        isSingleHome,
        expenses,
      }),
    [acquisitionPrice, sellingPrice, holdingYears, residenceYears, isSingleHome, expenses]
  );

  const calculator = getCalculator("capital-gains-tax");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              양도소득세(양도세) 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              취득가·양도가·보유기간을 입력하면 장기보유 특별공제와{" "}
              <strong className="text-text-primary">
                1세대 1주택 고가주택(12억 초과) 안분과세
              </strong>
              까지 반영해 실제 양도세를 계산합니다.
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
                  조건 입력
                </h2>

                {/* 시나리오 프리셋 (12억 초과 고가주택 빠른 설정) */}
                <div className="mb-5">
                  <p className="mb-2 text-xs font-medium text-text-secondary">
                    자주 찾는 시나리오 빠른 설정
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        label: "12억 이하 (비과세 확인)",
                        acq: 800_000_000,
                        sell: 1_200_000_000,
                        years: 5,
                        live: 5,
                      },
                      {
                        label: "15억 1주택 (10년)",
                        acq: 1_000_000_000,
                        sell: 1_500_000_000,
                        years: 10,
                        live: 10,
                      },
                      {
                        label: "20억 1주택 (10년)",
                        acq: 1_200_000_000,
                        sell: 2_000_000_000,
                        years: 10,
                        live: 10,
                      },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setIsSingleHome(true);
                          setAcquisitionPrice(p.acq);
                          setSellingPrice(p.sell);
                          setHoldingYears(p.years);
                          setResidenceYears(p.live);
                          setExpenses(0);
                        }}
                        className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:border-primary hover:text-primary"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1세대1주택 toggle */}
                <div className="mb-5">
                  <label className="mb-2 block text-sm font-medium text-text-primary">
                    1세대 1주택 여부
                  </label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => setIsSingleHome(true)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        isSingleHome
                          ? "bg-primary text-white"
                          : "bg-background text-text-secondary hover:bg-surface"
                      }`}
                    >
                      1세대 1주택
                    </button>
                    <button
                      onClick={() => setIsSingleHome(false)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        !isSingleHome
                          ? "bg-primary text-white"
                          : "bg-background text-text-secondary hover:bg-surface"
                      }`}
                    >
                      다주택 / 그 외
                    </button>
                  </div>
                  {isSingleHome && (
                    <p className="mt-1.5 text-xs text-text-secondary">
                      2년 이상 보유 + 양도가액 12억 이하 → 비과세. 12억 초과
                      고가주택은 초과분만 안분과세됩니다.
                    </p>
                  )}
                </div>

                {/* 취득가액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>취득가액</span>
                    <span className="tabular-nums text-primary">
                      {fmt(acquisitionPrice)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={acquisitionPrice}
                      onChange={(e) =>
                        setAcquisitionPrice(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={10_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 양도가액 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>양도가액</span>
                    <span className="tabular-nums text-primary">
                      {fmt(sellingPrice)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={(e) =>
                        setSellingPrice(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={10_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 필요경비 */}
                <div className="mb-5">
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>
                      필요경비{" "}
                      <span className="font-normal text-text-secondary">
                        (취득세, 중개수수료 등)
                      </span>
                    </span>
                    <span className="tabular-nums text-primary">
                      {fmt(expenses)}원
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) =>
                        setExpenses(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                      step={1_000_000}
                      min={0}
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      원
                    </span>
                  </div>
                </div>

                {/* 보유기간 */}
                <div className={isSingleHome ? "mb-5" : "mb-0"}>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>보유기간</span>
                    <span className="tabular-nums text-primary">
                      {holdingYears}년
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={holdingYears}
                    onChange={(e) => setHoldingYears(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-secondary">
                    <span>0년</span>
                    <span>30년</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 10, 15, 20].map((y) => (
                      <button
                        key={y}
                        onClick={() => setHoldingYears(y)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          holdingYears === y
                            ? "border-primary bg-primary text-white"
                            : "border-border text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                </div>

                {/* 거주기간 (1세대1주택일 때만 — 장특공 표2) */}
                {isSingleHome && (
                  <div className="mb-0">
                    <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                      <span>
                        거주기간{" "}
                        <span className="font-normal text-text-secondary">
                          (실제 거주, 장특공 표2)
                        </span>
                      </span>
                      <span className="tabular-nums text-primary">
                        {residenceYears}년
                      </span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(holdingYears, 10)}
                      step={1}
                      value={residenceYears}
                      onChange={(e) => setResidenceYears(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <p className="mt-1 text-xs text-text-secondary">
                      1세대 1주택은 보유(연 4%)와 거주(연 4%) 기간을 합쳐 최대
                      80%까지 공제됩니다. 거주 2년 미만이면 일반 공제율(표1)이
                      적용됩니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  계산 결과
                </h2>

                {/* 비과세 notice */}
                {result.isExempt ? (
                  <div className="mb-4 rounded-xl border border-positive bg-positive-light p-5 text-center">
                    <p className="text-lg font-bold text-positive">
                      비과세 대상
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      1세대 1주택 + 보유기간 2년 이상 + 양도가액 12억 이하로
                      양도소득세가 면제됩니다.
                    </p>
                    <div className="mt-3 rounded-lg bg-background px-4 py-3">
                      <p className="text-xs text-text-secondary">세후 순수익</p>
                      <p className="mt-1 text-2xl font-bold tabular-nums text-positive">
                        {fmt(result.gain)}원
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 고가주택 안분 안내 */}
                    {result.isHighValueSingleHome && (
                      <div className="mb-4 rounded-lg border border-primary/40 bg-primary-light px-4 py-3 text-sm text-text-primary">
                        <strong>고가주택 안분과세</strong> — 1세대 1주택이지만
                        양도가액이 12억을 초과해, 전체 양도차익 중{" "}
                        <strong className="text-primary">
                          {(result.highValueRatio * 100).toFixed(1)}%
                        </strong>
                        에 해당하는{" "}
                        <strong className="tabular-nums">
                          {fmt(result.taxableGain)}원
                        </strong>
                        만 과세됩니다.
                      </div>
                    )}

                    {/* 총 세금 highlight */}
                    <div className="mb-4 rounded-xl border border-primary bg-primary-light p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-text-secondary">
                            총 세금 (양도소득세 + 지방소득세)
                          </p>
                          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                            {fmt(result.totalTax)}
                            <span className="ml-1 text-lg font-medium">원</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-text-secondary">
                            세후 순수익
                          </p>
                          <p className="mt-1 text-xl font-bold tabular-nums text-positive">
                            {fmt(result.netProfit)}원
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detail rows */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          전체 양도차익
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {fmt(result.gain)}원
                        </span>
                      </div>
                      {result.isHighValueSingleHome && (
                        <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                          <span className="text-sm text-text-secondary">
                            과세대상 양도차익 (12억 초과분 안분)
                          </span>
                          <span className="tabular-nums text-sm font-semibold text-text-primary">
                            {fmt(result.taxableGain)}원
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          장기보유 특별공제
                          {result.longTermDeductionRate > 0 && (
                            <span className="ml-1 text-xs text-primary">
                              ({result.longTermDeductionRate.toFixed(0)}%)
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.longTermDeductionRate > 0
                            ? `- ${fmt(result.longTermDeduction)}원`
                            : "해당 없음 (3년 미만)"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          기본공제 (250만원)
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          - {fmt(result.basicDeduction)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                        <span className="text-sm font-medium text-text-primary">
                          과세표준
                        </span>
                        <span className="tabular-nums text-sm font-bold text-text-primary">
                          {fmt(result.taxBase)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          적용 세율 (한계)
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-text-primary">
                          {result.taxRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          양도소득세
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-negative">
                          {fmt(result.capitalGainsTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          지방소득세 (10%)
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-negative">
                          {fmt(result.localTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-primary bg-primary-light px-4 py-3">
                        <span className="text-sm font-bold text-text-primary">
                          총 세금
                        </span>
                        <span className="tabular-nums text-sm font-bold text-primary">
                          {fmt(result.totalTax)}원
                        </span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-positive bg-positive-light px-4 py-3">
                        <span className="text-sm font-bold text-text-primary">
                          세후 순수익
                        </span>
                        <span className="tabular-nums text-sm font-bold text-positive">
                          {fmt(result.netProfit)}원
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <p className="mt-4 text-xs text-text-secondary">
                  ※ 2026년 5월 기준 기본 세율로 계산한 참고용 추정치입니다.
                  다주택 중과세율·조정대상지역 거주요건·감면 특례 등 개별 상황은
                  반영되지 않으며, 정확한 세액은 홈택스 또는 세무 전문가를 통해
                  확인하세요.
                </p>
              </div>

              {/* Inline ad */}
              <AdSlot type="inline" />

              {/* 시나리오 가이드 — 항상 노출 (SEO 본문) */}
              <article className="space-y-6 rounded-xl border border-border bg-background p-5 sm:p-6">
                <header>
                  <h2 className="text-lg font-bold text-text-primary">
                    양도소득세, 상황별로 정확히 이해하기
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    같은 매도라도 1세대 1주택인지, 고가주택인지, 보유·거주
                    기간이 얼마인지에 따라 세금은 0원이 되기도, 수억이 되기도
                    합니다. 핵심 시나리오를 짚어 드립니다.
                  </p>
                </header>

                {/* 계산 흐름 */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    양도세는 이 순서로 계산됩니다
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    양도소득세는 ① 양도차익(양도가액 − 취득가액 − 필요경비) →
                    ② 장기보유 특별공제 차감 → ③ 양도소득 기본공제 250만원 차감
                    → ④ 과세표준에 6~45% 누진세율 적용 → ⑤ 산출세액의 10%를
                    지방소득세로 더하는 순서로 계산됩니다. 이 계산기는 이 흐름을
                    그대로 단계별로 보여 줘서, 어디서 세금이 늘고 줄어드는지
                    한눈에 확인할 수 있습니다.
                  </p>
                </section>

                {/* 1세대1주택 비과세 */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    1세대 1주택 비과세 — 4가지 요건을 모두 충족해야
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    가장 흔한 오해가 &ldquo;집 한 채면 무조건 비과세&rdquo;입니다.
                    실제로는 ① 1세대가 ② 양도일 현재 1주택을 보유하고 ③ 2년
                    이상 보유(취득 당시 조정대상지역이었다면 2년 이상 거주
                    요건 추가) ④ 양도가액 12억 원 이하일 때 비과세됩니다. 네
                    가지 중 하나라도 빠지면 과세 대상이 됩니다. 특히
                    조정대상지역에서 산 집은 &ldquo;살지 않고 전세만 줬다&rdquo;면
                    거주요건 미충족으로 비과세가 막힐 수 있습니다.
                  </p>
                </section>

                {/* 고가주택 안분 (차별화 포인트) */}
                <section className="space-y-2 rounded-lg border border-primary/30 bg-primary-light/50 p-4">
                  <h3 className="text-base font-semibold text-text-primary">
                    12억 초과 고가주택 — 단순 계산기가 가장 많이 틀리는 부분
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    1세대 1주택이라도 양도가액이 12억을 넘으면
                    &lsquo;고가주택&rsquo;으로 분류돼, 비과세와 과세가 섞입니다.
                    이때 전체 양도차익에 세금을 매기는 게 아니라, 12억을 초과한
                    비율만큼만 과세합니다.
                  </p>
                  <div className="rounded-lg bg-background p-3 text-sm text-text-primary">
                    과세 양도차익 = 전체 양도차익 ×{" "}
                    <span className="whitespace-nowrap">
                      (양도가액 − 12억) ÷ 양도가액
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    예를 들어 15억에 판 1주택의 양도차익이 5억이라면, 과세
                    대상은 5억 전체가 아니라 5억 × (15억−12억)/15억 ={" "}
                    <strong className="text-text-primary">1억 원</strong>입니다.
                    많은 무료 계산기가 이 안분을 생략해 세금을 몇 배 과다하게
                    표시하는데, 이 계산기는 12억 초과 안분과 1세대 1주택
                    장기보유 특별공제(최대 80%)를 함께 반영합니다.
                  </p>
                </section>

                {/* 장특공 표1 vs 표2 */}
                <section className="space-y-3">
                  <h3 className="text-base font-semibold text-text-primary">
                    장기보유 특별공제 — 일반(표1) vs 1세대 1주택(표2)
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    같은 10년 보유라도 일반 부동산은 20%, 1세대 1주택은 최대
                    80%까지 공제됩니다. 차이가 매우 크기 때문에 거주요건을
                    채우는 것이 절세의 핵심입니다.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-text-secondary">
                          <th className="py-2 pr-3 font-medium">보유기간</th>
                          <th className="py-2 pr-3 font-medium">
                            표1 (일반)
                          </th>
                          <th className="py-2 font-medium">
                            표2 (1세대 1주택, 보유+거주)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-text-primary">
                        <tr className="border-b border-border/60">
                          <td className="py-2 pr-3">3년</td>
                          <td className="py-2 pr-3">6%</td>
                          <td className="py-2">최대 24% (보유12+거주12)</td>
                        </tr>
                        <tr className="border-b border-border/60">
                          <td className="py-2 pr-3">5년</td>
                          <td className="py-2 pr-3">10%</td>
                          <td className="py-2">최대 40%</td>
                        </tr>
                        <tr className="border-b border-border/60">
                          <td className="py-2 pr-3">10년</td>
                          <td className="py-2 pr-3">20%</td>
                          <td className="py-2">최대 80%</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-3">15년 이상</td>
                          <td className="py-2 pr-3">30% (상한)</td>
                          <td className="py-2">최대 80% (상한)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-text-secondary">
                    표2는 보유기간 연 4%(최대 40%, 10년)와 거주기간 연 4%(최대
                    40%, 10년)를 더해 산정합니다. 거주 2년 미만이면 표2가 아닌
                    표1이 적용됩니다.
                  </p>
                </section>

                {/* 일시적 2주택 */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    일시적 2주택 — 이사 때문에 잠깐 2채라면
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    이사·갈아타기 과정에서 신규 주택을 먼저 사 일시적으로 2채가
                    된 경우, 종전 주택을 신규 주택 취득일로부터 3년 이내에
                    양도하면 종전 주택을 1세대 1주택으로 보아 비과세 받을 수
                    있습니다(종전 주택 2년 이상 보유 등 요건 충족 시). 이
                    계산기는 단일 주택 기준으로 계산하므로, 일시적 2주택 특례
                    대상이라면 종전 주택 매도분을 1세대 1주택으로 두고 계산해
                    보세요.
                  </p>
                </section>

                {/* 필요경비 */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    필요경비로 인정되는 것 / 안 되는 것
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-positive/30 bg-positive-light/50 p-3">
                      <p className="text-sm font-semibold text-positive">
                        인정 (세금 ↓)
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-text-secondary">
                        <li>취득세·등록세, 법무사 보수</li>
                        <li>취득·양도 시 중개수수료</li>
                        <li>발코니 확장, 새시 교체 등 자본적 지출</li>
                        <li>양도 관련 컨설팅·소송 비용</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-negative/30 bg-negative-light/50 p-3">
                      <p className="text-sm font-semibold text-negative">
                        불인정 (세금 영향 없음)
                      </p>
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm text-text-secondary">
                        <li>도배·장판·페인트 등 수익적 지출</li>
                        <li>보유 중 낸 재산세·종부세</li>
                        <li>대출 이자</li>
                        <li>증빙(세금계산서·계좌이체) 없는 비용</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 신고 기한 */}
                <section className="space-y-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    신고·납부 기한을 놓치면 가산세
                  </h3>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    양도세는 양도일(잔금 청산일 또는 등기일 중 빠른 날)이 속한
                    <strong className="text-text-primary"> 달의 말일부터 2개월 이내</strong>
                    에 예정신고·납부해야 합니다. 한 해에 두 건 이상 양도해
                    합산이 필요하면 다음 해 5월 확정신고를 합니다. 기한을 넘기면
                    신고불성실(최대 20%)·납부지연 가산세가 붙으므로, 매도를
                    결정했다면 미리 세액을 추정해 두는 것이 안전합니다.
                  </p>
                </section>
              </article>

              {/* 간단 가이드 (접이식, 보조) */}
              <GuideText title="용어 빠르게 보기">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">양도차익</strong>
                    <p className="mt-0.5">
                      양도가액 − 취득가액 − 필요경비. 세금 계산의 출발점입니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">과세표준</strong>
                    <p className="mt-0.5">
                      양도차익에서 장기보유 특별공제와 기본공제 250만원을 뺀
                      금액. 여기에 누진세율을 곱합니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">지방소득세</strong>
                    <p className="mt-0.5">
                      양도소득세(국세)의 10%가 지방소득세로 별도 부과됩니다.
                      실제 부담은 둘을 합한 금액입니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              {/* Related */}
              <RelatedCalculators calculatorId="capital-gains-tax" />
            </div>

            {/* Right: Sidebar */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="양도소득세 계산기 - Tooly"
                  description={`취득 ${fmtEok(acquisitionPrice)}억 → 양도 ${fmtEok(sellingPrice)}억 / 보유 ${holdingYears}년 → 총 세금 ${fmt(result.totalTax)}원`}
                />
              </div>

              {/* Quick summary card */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  요약
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">양도차익</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.gain)}원
                    </span>
                  </div>
                  {!result.isExempt && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">과세표준</span>
                        <span className="tabular-nums font-medium text-text-primary">
                          {fmt(result.taxBase)}원
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">적용 세율</span>
                        <span className="tabular-nums font-medium text-text-primary">
                          {result.taxRate.toFixed(0)}%
                        </span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="font-semibold text-text-primary">
                          총 세금
                        </span>
                        <span className="tabular-nums font-bold text-negative">
                          {fmt(result.totalTax)}원
                        </span>
                      </div>
                    </>
                  )}
                  {result.isExempt && (
                    <div className="border-t border-border pt-2">
                      <span className="font-bold text-positive">비과세</span>
                    </div>
                  )}
                </div>
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
