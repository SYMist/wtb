"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  kmhToMs,
  kmhToMph,
  msToKmh,
  msToMph,
  mphToKmh,
  mphToMs,
} from "@/lib/calculators/speed";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import GuideText from "@/components/common/GuideText";
import RelatedCalculators from "@/components/common/RelatedCalculators";
import ShareButton from "@/components/common/ShareButton";
import JsonLd from "@/components/common/JsonLd";
import { getCalculator } from "@/lib/data/calculators";

type ActiveUnit = "kmh" | "ms" | "mph" | null;

interface SpeedState {
  kmh: string;
  ms: string;
  mph: string;
}

const REFERENCE_SPEEDS = [
  { label: "보행 속도", kmh: 5 },
  { label: "자전거", kmh: 20 },
  { label: "시내 도로", kmh: 60 },
  { label: "고속도로", kmh: 100 },
  { label: "KTX", kmh: 300 },
  { label: "여객기", kmh: 900 },
];

function fmt(n: number): string {
  return n.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
}

function SpeedConverterInner() {
  useSearchParams();

  const [speeds, setSpeeds] = useState<SpeedState>({
    kmh: "",
    ms: "",
    mph: "",
  });
  const [activeUnit, setActiveUnit] = useState<ActiveUnit>(null);

  const handleChange = (unit: ActiveUnit, value: string) => {
    setActiveUnit(unit);
    const num = value === "" ? NaN : Number(value);

    if (value === "" || isNaN(num)) {
      setSpeeds({ kmh: "", ms: "", mph: "" });
      return;
    }

    if (unit === "kmh") {
      setSpeeds({
        kmh: value,
        ms: String(kmhToMs(num)),
        mph: String(kmhToMph(num)),
      });
    } else if (unit === "ms") {
      setSpeeds({
        kmh: String(msToKmh(num)),
        ms: value,
        mph: String(msToMph(num)),
      });
    } else if (unit === "mph") {
      setSpeeds({
        kmh: String(mphToKmh(num)),
        ms: String(mphToMs(num)),
        mph: value,
      });
    }
  };

  const handleReferenceClick = (kmh: number) => {
    setSpeeds({
      kmh: String(kmh),
      ms: String(kmhToMs(kmh)),
      mph: String(kmhToMph(kmh)),
    });
    setActiveUnit("kmh");
  };

  const calculator = getCalculator("speed-converter");

  const inputClass = (unit: ActiveUnit) =>
    `w-full rounded-lg border px-4 py-3 text-lg tabular-nums font-semibold focus:outline-none transition-colors ${
      activeUnit === unit
        ? "border-primary bg-primary-light text-primary"
        : "border-border bg-background text-text-primary focus:border-primary"
    }`;

  return (
    <>
      <GNB />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              속도 단위 변환기
            </h1>
            <p className="mt-2 text-text-secondary">
              km/h, m/s, mph 중 어느 단위로 입력해도 나머지 두 단위로 즉시 변환됩니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Left */}
            <div className="flex-1 space-y-6">
              {/* Input fields */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  속도 입력 (어느 단위든 입력 가능)
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      km/h (킬로미터/시간)
                    </label>
                    <input
                      type="number"
                      value={speeds.kmh}
                      onChange={(e) => handleChange("kmh", e.target.value)}
                      placeholder="km/h 입력"
                      min={0}
                      className={inputClass("kmh")}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      m/s (미터/초)
                    </label>
                    <input
                      type="number"
                      value={speeds.ms}
                      onChange={(e) => handleChange("ms", e.target.value)}
                      placeholder="m/s 입력"
                      min={0}
                      className={inputClass("ms")}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                      mph (마일/시간)
                    </label>
                    <input
                      type="number"
                      value={speeds.mph}
                      onChange={(e) => handleChange("mph", e.target.value)}
                      placeholder="mph 입력"
                      min={0}
                      className={inputClass("mph")}
                    />
                  </div>
                </div>
              </div>

              {/* Reference speeds */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-text-primary">
                  주요 속도 참고
                </h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {REFERENCE_SPEEDS.map(({ label, kmh }) => (
                    <button
                      key={label}
                      onClick={() => handleReferenceClick(kmh)}
                      className="rounded-lg border border-border px-3 py-2 text-left transition-colors hover:border-primary hover:bg-primary-light"
                    >
                      <p className="text-xs font-medium text-text-primary">
                        {label}
                      </p>
                      <p className="mt-0.5 tabular-nums text-xs text-text-secondary">
                        {kmh} km/h
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference table */}
              <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-text-primary">
                  속도 변환 참고표
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-text-secondary">
                          구분
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          km/h
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          m/s
                        </th>
                        <th className="pb-2 text-right font-medium text-text-secondary">
                          mph
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {REFERENCE_SPEEDS.map(({ label, kmh }) => (
                        <tr key={label}>
                          <td className="py-2 text-text-primary">{label}</td>
                          <td className="py-2 text-right tabular-nums text-text-primary">
                            {fmt(kmh)}
                          </td>
                          <td className="py-2 text-right tabular-nums text-text-primary">
                            {fmt(kmhToMs(kmh))}
                          </td>
                          <td className="py-2 text-right tabular-nums text-text-primary">
                            {fmt(kmhToMph(kmh))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <AdSlot type="inline" />

              <GuideText title="속도 단위 변환 공식">
                <div className="space-y-3">
                  <div>
                    <strong className="text-text-primary">km/h ↔ m/s</strong>
                    <p className="mt-0.5">
                      km/h를 3.6으로 나누면 m/s가 됩니다. m/s에 3.6을 곱하면 km/h가 됩니다.
                    </p>
                    <p className="mt-0.5 tabular-nums text-xs">
                      예: 100 km/h ÷ 3.6 ≈ 27.78 m/s
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">km/h ↔ mph</strong>
                    <p className="mt-0.5">
                      km/h를 1.60934로 나누면 mph가 됩니다. mph에 1.60934를 곱하면 km/h가 됩니다.
                    </p>
                    <p className="mt-0.5 tabular-nums text-xs">
                      예: 100 km/h ÷ 1.60934 ≈ 62.14 mph
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">m/s ↔ mph</strong>
                    <p className="mt-0.5">
                      m/s에 3.6을 곱한 후 1.60934로 나누면 mph가 됩니다.
                    </p>
                    <p className="mt-0.5 tabular-nums text-xs">
                      예: 10 m/s × 3.6 ÷ 1.60934 ≈ 22.37 mph
                    </p>
                  </div>
                  <div>
                    <strong className="text-text-primary">단위 의미</strong>
                    <ul className="mt-0.5 list-disc pl-4">
                      <li>km/h: 킬로미터/시간. 한국·유럽 도로 표지판 단위</li>
                      <li>m/s: 미터/초. 물리·과학 계산에서 주로 사용</li>
                      <li>mph: 마일/시간(miles per hour). 미국·영국 도로 단위</li>
                    </ul>
                  </div>
                </div>
              </GuideText>

              <RelatedCalculators calculatorId="speed-converter" />
            </div>

            {/* Right: Result summary + Share */}
            <aside className="w-full space-y-4 lg:sticky lg:top-20 lg:w-80">
              {speeds.kmh !== "" && (
                <div className="rounded-xl border border-primary bg-primary-light p-5">
                  <p className="text-xs font-medium text-text-secondary">
                    변환 결과
                  </p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <p className="text-xs text-text-secondary">km/h</p>
                      <p className="text-2xl font-bold tabular-nums text-primary">
                        {speeds.kmh !== "" ? fmt(Number(speeds.kmh)) : "-"}
                      </p>
                    </div>
                    <div className="border-t border-primary/20 pt-3">
                      <p className="text-xs text-text-secondary">m/s</p>
                      <p className="text-2xl font-bold tabular-nums text-primary">
                        {speeds.ms !== "" ? fmt(Number(speeds.ms)) : "-"}
                      </p>
                    </div>
                    <div className="border-t border-primary/20 pt-3">
                      <p className="text-xs text-text-secondary">mph</p>
                      <p className="text-2xl font-bold tabular-nums text-primary">
                        {speeds.mph !== "" ? fmt(Number(speeds.mph)) : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {speeds.kmh === "" && (
                <div className="rounded-xl border border-border bg-surface p-5 text-center text-sm text-text-secondary">
                  속도를 입력하면 결과가 여기에 표시됩니다.
                </div>
              )}

              <div className="rounded-xl border border-border bg-background p-4">
                <p className="mb-3 text-xs font-medium text-text-secondary">
                  결과 공유하기
                </p>
                <ShareButton
                  title="속도 단위 변환기 - Tooly"
                  description={
                    speeds.kmh
                      ? `${fmt(Number(speeds.kmh))} km/h = ${fmt(Number(speeds.ms))} m/s = ${fmt(Number(speeds.mph))} mph`
                      : "km/h, m/s, mph 속도 단위 변환"
                  }
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

export default function SpeedConverterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-text-secondary">
          로딩 중...
        </div>
      }
    >
      <SpeedConverterInner />
    </Suspense>
  );
}
