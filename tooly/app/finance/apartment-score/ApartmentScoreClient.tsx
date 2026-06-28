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
  ApartmentInput,
  CRITERIA,
  CriterionKey,
  DEFAULT_ORDER,
  calculateApartmentScore,
  weightsFromOrder,
} from "@/lib/calculators/apartment-score";

const CRITERION_LABEL: Record<CriterionKey, string> = CRITERIA.reduce(
  (acc, c) => {
    acc[c.key] = c.label;
    return acc;
  },
  {} as Record<CriterionKey, string>
);

// 랜딩(본인 실매수 스토리) 페이지 URL — 별도 줄기로 본인이 제작(볼트 밖).
// URL 확보 전까지 비워둠. 채우면 결과 하단에 "이 기준 만든 사람 사례" 보조 링크가 노출된다.
const LANDING_URL = "";

const STORAGE_KEY = "apartment-score:saved";
const SITE_DOMAIN = "tooly.deluxo.co.kr";

interface SavedProperty {
  id: string;
  name: string;
  input: ApartmentInput;
}

const DEFAULT_INPUT: ApartmentInput = {
  stationMinutes: 5,
  gangnamMinutes: 40,
  areaSqm: 84,
  builtYear: 2015,
  households: 800,
  condition: 3,
};

function interpret(ratio: number): string {
  if (ratio >= 0.8) return "내 기준으로는 최상위 후보예요.";
  if (ratio >= 0.65) return "꽤 괜찮은 후보입니다.";
  if (ratio >= 0.5) return "보통 — 다른 후보와 비교해볼 만해요.";
  return "내 기준에는 아쉬운 편이에요.";
}

export default function ApartmentScoreClient() {
  const [input, setInput] = useState<ApartmentInput>(DEFAULT_INPUT);
  const [name, setName] = useState("");
  const [order, setOrder] = useState<CriterionKey[]>(DEFAULT_ORDER);
  const [showWeights, setShowWeights] = useState(false);
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [shareToast, setShareToast] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const completedRef = useRef(false);
  const adViewedRef = useRef(false);
  const adWrapRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 계산기 도착 (약한 고리 #1 측정 시작점)
  useEffect(() => {
    trackEvent("apartment_arrival");
  }, []);

  // 저장 매물 로드 (브라우저 전용 — 마운트 후 1회, 정적 프리렌더 유지)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage는 브라우저 전용이라 마운트 후 1회 반영(의도적). */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedProperty[]);
    } catch {
      // 손상된 데이터 무시
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 애드센스 다리 — 결과 옆 광고가 실제로 노출됐는지(impression) 1회 기록
  useEffect(() => {
    const el = adWrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const ob = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !adViewedRef.current) {
            adViewedRef.current = true;
            trackEvent("apartment_bridge_adsense_view");
            ob.disconnect();
          }
        }
      },
      { threshold: 0.5 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  const persist = useCallback((next: SavedProperty[]) => {
    setSaved(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 저장 실패(용량/프라이빗 모드) 무시
    }
  }, []);

  const updateInput = useCallback(
    <K extends keyof ApartmentInput>(key: K, value: ApartmentInput[K]) => {
      setSubmitted(false);
      setInput((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const weights = weightsFromOrder(order);
  const result = calculateApartmentScore(input, weights);
  const ratio = result.maxScore > 0 ? result.total / result.maxScore : 0;
  const maxContribution = Math.max(
    ...result.breakdown.map((b) => b.contribution),
    1
  );

  // 순위표 — 저장 매물을 현재 가중치로 재계산(같은 가중치 세트 내 비교)
  const ranking = saved
    .map((s) => ({ ...s, ...calculateApartmentScore(s.input, weights) }))
    .sort((a, b) => b.total - a.total);

  const handleSave = () => {
    trackEvent("apartment_bridge_save");
    const label = name.trim() || `매물 ${saved.length + 1}`;
    persist([...saved, { id: `${Date.now()}`, name: label, input }]);
    setName("");
  };

  const handleDelete = (id: string) => {
    persist(saved.filter((s) => s.id !== id));
  };

  // 우선순위 재배열 — 위로 올릴수록 높은 점수(5→1)
  const moveCriterion = (index: number, dir: -1 | 1) => {
    setOrder((prev) => {
      const j = index + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const handleShare = async () => {
    trackEvent("apartment_bridge_share");
    const label = name.trim() || "이 매물";
    const text = `${label} 아파트 점수 ${result.total}/${result.maxScore}점 — 내 기준으로 매겨봤어요. ${SITE_DOMAIN}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "아파트 점수", text, url: window.location.href });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // 취소/실패 무시
    }
    setShareToast("결과 카드를 스크린샷해서 공유해 보세요!");
    setTimeout(() => setShareToast(""), 3000);
  };

  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <h1 className="mb-1 text-2xl font-bold text-text-primary">
          아파트 점수 계산기
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          역세권·강남 접근·면적·컨디션·세대수·연식 5가지 기준에 내 가중치를 매겨
          매물 점수를 내고 후보끼리 비교합니다.
        </p>

        <AdSlot type="banner" />

        <div className="mt-4 flex flex-col gap-6 lg:flex-row">
          {/* 입력 폼 */}
          <div className="w-full space-y-4 lg:w-1/2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">
                매물 이름 (저장·비교용)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 래미안 OO 84A"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary"
              />
            </div>

            <InputGroup title="거리 (교통 접근)">
              <p className="-mt-1 rounded-md bg-surface px-3 py-2 text-xs leading-relaxed text-text-secondary">
                측정 기준 고정: <strong>역까지</strong>는 지도앱 도보 시간,{" "}
                <strong>강남까지</strong>는 매물 주소→강남역 대중교통, 평일 오전
                첫 경로로 재세요. (기준을 통일해야 매물끼리 공정 비교)
              </p>
              <NumberInput
                label="역까지 도보 (분)"
                value={input.stationMinutes}
                onChange={(v) => updateInput("stationMinutes", v)}
                max={120}
                unit="분"
              />
              <NumberInput
                label="강남역까지 (분)"
                value={input.gangnamMinutes}
                onChange={(v) => updateInput("gangnamMinutes", v)}
                max={300}
                unit="분"
              />
            </InputGroup>

            <InputGroup title="단지 정보">
              <NumberInput
                label="전용면적 (㎡)"
                value={input.areaSqm}
                onChange={(v) => updateInput("areaSqm", v)}
                max={500}
                unit="㎡"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">
                  준공연도
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={input.builtYear}
                  onChange={(e) =>
                    updateInput("builtYear", Number(e.target.value) || 0)
                  }
                  min={1970}
                  max={new Date().getFullYear()}
                  className="tabular-nums w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary"
                />
              </div>
              <NumberInput
                label="세대수"
                value={input.households}
                onChange={(v) => updateInput("households", v)}
                max={20000}
                unit="세대"
              />
              <Select
                label="컨디션 (1~5, 높을수록 좋음)"
                value={String(input.condition)}
                onChange={(v) => updateInput("condition", Number(v))}
                options={[
                  { value: "1", label: "1 — 노후/수리 필요" },
                  { value: "2", label: "2 — 다소 낡음" },
                  { value: "3", label: "3 — 보통" },
                  { value: "4", label: "4 — 양호" },
                  { value: "5", label: "5 — 신축급/올수리" },
                ]}
              />
            </InputGroup>

            <button
              type="button"
              onClick={() => {
                setSubmitted(true);
                if (!completedRef.current) {
                  completedRef.current = true;
                  trackEvent("apartment_complete");
                }
                requestAnimationFrame(() => {
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                });
              }}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {submitted ? "점수 다시 보기" : "점수 보기"}
            </button>
          </div>

          {/* 결과 패널 */}
          <div ref={resultRef} className="w-full lg:w-1/2">
            <div className="lg:sticky lg:top-20">
              {!submitted ? (
                <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-text-secondary">
                  매물 정보를 입력하고 &lsquo;점수 보기&rsquo;를 누르면 내 기준
                  점수를 보여드려요.
                </div>
              ) : (
              <>
              {/* 결과 카드 (공유 스크린샷 대상 — 워터마크 포함) */}
              <div className="rounded-xl border border-border bg-surface p-5">
                <div className="text-sm text-text-secondary">총점</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="tabular-nums text-4xl font-bold text-primary">
                    {result.total}
                  </span>
                  <span className="tabular-nums text-lg text-text-secondary">
                    / {result.maxScore}점
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-text-primary">
                  {interpret(ratio)}
                </p>

                {/* 기준별 기여 — 길이만(가중치 숫자 비노출) */}
                <div className="mt-4 space-y-2.5">
                  {result.breakdown.map((b) => (
                    <div key={b.key}>
                      <div className="mb-1 text-xs text-text-secondary">
                        {b.label}
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${(b.contribution / maxContribution) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-text-secondary">
                  막대 길이 = 총점 기여도. 기준별 가중치 비중은{" "}
                  <span className="font-medium">공유 점수표(엑셀)</span>에서 확인하세요.
                </p>

                {/* 워터마크 */}
                <div className="mt-4 border-t border-border pt-3 text-right text-xs font-semibold text-text-secondary">
                  {SITE_DOMAIN}
                </div>
              </div>

              {/* 나가는 다리: 저장 / 공유 */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                >
                  점수 저장 (다른 후보랑 비교)
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface"
                >
                  공유
                </button>
              </div>
              {shareToast && (
                <p className="mt-2 text-xs text-positive">{shareToast}</p>
              )}

              {/* 상호 다리 → 대출 감당 시뮬 */}
              <Link
                href="/finance/apartment-loan"
                onClick={() => trackEvent("apartment_bridge_loan")}
                className="mt-2 flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
              >
                이 집, 대출은 감당되나? → 대출 시뮬
              </Link>

              {/* 가중치 조정 (접이식 — 기본 프리셋) */}
              <div className="mt-3 rounded-lg border border-border">
                <button
                  onClick={() => setShowWeights((s) => !s)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-primary"
                >
                  <span>우선순위 바꾸기 — 가장 중요한 기준부터</span>
                  <span className="text-text-secondary">
                    {showWeights ? "▲" : "▼"}
                  </span>
                </button>
                {showWeights && (
                  <div className="space-y-3 border-t border-border px-4 py-4">
                    <p className="text-xs text-text-secondary">
                      기본은 제 관점(거리&gt;면적&gt;컨디션&gt;세대수&gt;연식)이에요.
                      학군·면적이 더 중요하면 위로 올리세요. 순위에 따라
                      5·4·3·2·1점이 자동 배분됩니다 (만점 75점 고정).
                    </p>
                    <ul className="space-y-2">
                      {order.map((key, i) => (
                        <li
                          key={key}
                          className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2"
                        >
                          <span className="tabular-nums flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {weights[key]}
                          </span>
                          <span className="flex-1 text-sm font-medium text-text-primary">
                            {CRITERION_LABEL[key]}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {i + 1}순위
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveCriterion(i, -1)}
                              disabled={i === 0}
                              aria-label={`${CRITERION_LABEL[key]} 우선순위 올리기`}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:bg-background disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveCriterion(i, 1)}
                              disabled={i === order.length - 1}
                              aria-label={`${CRITERION_LABEL[key]} 우선순위 내리기`}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary transition-colors hover:bg-background disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setOrder(DEFAULT_ORDER)}
                      className="text-xs text-primary underline"
                    >
                      기본 순서로 되돌리기
                    </button>
                  </div>
                )}
              </div>

              {/* 애드센스 다리 (점수 본 직후 = 체류 의향 최고점) */}
              <div ref={adWrapRef}>
                <AdSlot type="inline" className="mt-4" />
              </div>
              </>
              )}
            </div>
          </div>
        </div>

        {/* 저장 매물 순위표 */}
        {ranking.length > 0 && (
          <div className="mt-8 rounded-xl border border-border p-5">
            <h2 className="mb-1 text-lg font-bold text-text-primary">
              내 후보 순위
            </h2>
            <p className="mb-3 text-xs text-text-secondary">
              현재 우선순위(만점 {result.maxScore}점) 기준으로 정렬됩니다.
              우선순위를 바꾸면 순위도 다시 매겨져요.
            </p>
            <ol className="space-y-2">
              {ranking.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2.5"
                >
                  <span className="tabular-nums w-6 text-center text-sm font-bold text-text-secondary">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-text-primary">
                    {r.name}
                  </span>
                  <span className="tabular-nums text-sm font-semibold text-primary">
                    {r.total}
                    <span className="font-normal text-text-secondary">
                      {" "}
                      / {r.maxScore}
                    </span>
                  </span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    aria-label="삭제"
                    className="text-text-secondary transition-colors hover:text-negative"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 랜딩 보조 링크 (하단 보조) — URL 확보 시 노출 */}
        {LANDING_URL && (
          <div className="mt-6 text-center">
            <a
              href={LANDING_URL}
              onClick={() => trackEvent("apartment_bridge_landing")}
              className="text-sm text-primary underline"
            >
              이 점수 기준을 만든 사람의 실제 매수 사례 보기 →
            </a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
