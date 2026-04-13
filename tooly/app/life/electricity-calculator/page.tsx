"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  calculateElectricity,
  type UsageType,
} from "@/lib/calculators/electricity";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(n).toLocaleString("ko-KR");

function ElectricityCalculatorInner() {
  useSearchParams();

  const [kwh, setKwh] = useState(300);
  const [kwhInput, setKwhInput] = useState("300");
  const [usageType, setUsageType] = useState<UsageType>("residential");

  const result = useMemo(
    () => calculateElectricity(kwh, usageType),
    [kwh, usageType]
  );

  const handleSliderChange = (val: number) => {
    setKwh(val);
    setKwhInput(String(val));
  };

  const handleInputChange = (raw: string) => {
    setKwhInput(raw);
    const num = Number(raw);
    if (!isNaN(num) && num >= 0 && num <= 1000) {
      setKwh(num);
    }
  };

  const calculator = getCalculator("electricity-calculator");

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              전기요금 계산기
            </h1>
            <p className="mt-2 text-text-secondary">
              월 사용량을 입력하면 한전 누진세를 적용한 전기요금을 자동으로
              계산합니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left: Inputs */}
            <div className="flex-1 space-y-6">
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  사용량 입력
                </h2>

                {/* Usage type toggle */}
                <div className="mb-5">
                  <p className="mb-2 text-sm font-medium text-text-primary">
                    용도
                  </p>
                  <div className="flex gap-3">
                    {(
                      [
                        { value: "residential", label: "주거용" },
                        { value: "general", label: "일반용" },
                      ] as { value: UsageType; label: string }[]
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setUsageType(value)}
                        className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                          usageType === value
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* kWh slider */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-sm font-medium text-text-primary">
                    <span>사용량</span>
                    <span className="tabular-nums text-primary">
                      {kwh} kWh
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={1}
                    value={kwh}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-text-secondary">
                    <span>0 kWh</span>
                    <span>1000 kWh</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="number"
                      value={kwhInput}
                      min={0}
                      max={1000}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-32 rounded-lg border border-border px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none"
                    />
                    <span className="flex items-center text-sm text-text-secondary">
                      kWh
                    </span>
                  </div>
                </div>
              </div>

              {/* Tier breakdown table (residential only) */}
              {usageType === "residential" && result.tierBreakdown.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                  <h2 className="mb-3 text-base font-semibold text-text-primary">
                    누진세 구간별 내역
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="pb-2 text-left font-medium text-text-secondary">
                            구간
                          </th>
                          <th className="pb-2 text-right font-medium text-text-secondary">
                            사용량
                          </th>
                          <th className="pb-2 text-right font-medium text-text-secondary">
                            단가
                          </th>
                          <th className="pb-2 text-right font-medium text-text-secondary">
                            금액
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {result.tierBreakdown.map((tier) => (
                          <tr key={tier.tier}>
                            <td className="py-2 text-text-primary">
                              {tier.tier}
                            </td>
                            <td className="py-2 text-right tabular-nums text-text-primary">
                              {tier.kwh} kWh
                            </td>
                            <td className="py-2 text-right tabular-nums text-text-primary">
                              {tier.rate.toFixed(1)}원
                            </td>
                            <td className="py-2 text-right tabular-nums font-medium text-text-primary">
                              {fmt(tier.cost)}원
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <AdSlot type="inline" />

              <GuideText title="전기요금 누진세 구간 안내">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">누진세란?</strong>
                    <p className="mt-0.5">
                      전기 사용량이 많을수록 높은 단가를 적용하는 요금 체계입니다.
                      사용량이 구간을 초과하면 초과분에만 높은 단가가 적용됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">주거용 누진세 구간 (2026년 기준)</strong>
                    <ul className="mt-1 space-y-0.5">
                      <li>1구간 (0~200 kWh): 120원/kWh</li>
                      <li>2구간 (201~400 kWh): 214.6원/kWh</li>
                      <li>3구간 (401 kWh~): 307.3원/kWh</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-text-primary">기본요금</strong>
                    <ul className="mt-1 space-y-0.5">
                      <li>200 kWh 이하: 910원</li>
                      <li>201~400 kWh: 1,600원</li>
                      <li>401 kWh 초과: 7,300원</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-text-primary">부가세 및 기금</strong>
                    <p className="mt-0.5">
                      부가가치세(10%)와 전력산업기반기금(3.7%)이 기본요금+전력량요금 합계에 부과됩니다.
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">일반용 전기</strong>
                    <p className="mt-0.5">
                      상업·업무용 건물에 적용되는 단일 단가 요금제입니다. 누진세가 없으며 단가는 160.3원/kWh입니다.
                    </p>
                  </div>
                </div>
              </GuideText>

              <RelatedCalculators calculatorId="electricity-calculator" />
            </div>

            {/* Right: Results */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {/* Total fee card */}
              <div className="rounded-xl border border-primary bg-primary-light p-5">
                <p className="text-xs font-medium text-text-secondary">
                  총 전기요금
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
                  {fmt(result.totalFee)}
                  <span className="ml-1 text-lg font-medium">원</span>
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {kwh} kWh 사용 / {usageType === "residential" ? "주거용" : "일반용"}
                </p>
              </div>

              {/* Breakdown card */}
              <div className="rounded-xl border border-border bg-background p-4">
                <h3 className="mb-3 text-sm font-semibold text-text-primary">
                  요금 상세 내역
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">기본요금</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.baseFee)}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">전력량요금</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.usageFee)}원
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-text-secondary">소계</span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.totalBeforeTax)}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      부가세 (10%)
                    </span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.vat)}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">
                      전력산업기반기금 (3.7%)
                    </span>
                    <span className="tabular-nums font-medium text-text-primary">
                      {fmt(result.fund)}원
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-semibold">
                    <span className="text-text-primary">합계</span>
                    <span className="tabular-nums text-primary">
                      {fmt(result.totalFee)}원
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="전기요금 계산기 - Tooly"
                  description={`${kwh}kWh 사용 → 총 ${fmt(result.totalFee)}원`}
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

export default function ElectricityCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <ElectricityCalculatorInner />
    </Suspense>
  );
}
