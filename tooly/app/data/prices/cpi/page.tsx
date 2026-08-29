import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import cpiIndexData from "@/lib/data/cpi-index-series.json";
import cpiRateData from "@/lib/data/cpi-rate-series.json";
import { buildYearlyRateProse } from "@/lib/data/yearly-rate-prose";
import {
  KRW_BASE_AMOUNT,
  buildMoneyPresets,
  compareMoneyValue,
  firstParam,
  resolveMonth,
  shiftMonths,
  type MonthAdjustment,
} from "@/lib/data/cpi-compare";
import RateChart from "../../_components/RateChart";
import RateTable from "../../_components/RateTable";
import TrackedCtaLink from "../../_components/TrackedCtaLink";
import YearlyAverageTable from "../../_components/YearlyAverageTable";
import CpiConvertRunTracker from "../../_components/CpiConvertRunTracker";

type Point = { date: string; rate: number };
type SeriesData = {
  series: Point[];
  latest: Point;
  stats: { max: Point; min: Point; average: number };
  /** 데이터가 마지막으로 바뀐 날 — schema.org dateModified. */
  updatedAt: string;
  /** 원천(ECOS)을 마지막으로 확인한 날. */
  checkedAt?: string;
  /** 지수 기준연도(예: 2020=100 → 2020). 기준연도 개편 시 바뀐다. */
  baseYear?: number;
};

const indexData = cpiIndexData as SeriesData;
const rateData = cpiRateData as SeriesData;

const BASE_URL = "https://tooly.deluxo.co.kr";
const PATH = "/data/prices/cpi";
const PAGE_URL = `${BASE_URL}${PATH}`;

type SearchParams = Record<string, string | string[] | undefined>;

const fmtWon = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}원`;
const fmtSignedPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const fmtPercent = (v: number) => `${v.toFixed(2)}%`;

function formatYM(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

function computeChange(series: Point[]) {
  if (series.length < 2) return 0;
  return series[series.length - 1].rate - series[series.length - 2].rate;
}

/** 최근 N개월 중 최고·최저. "역대 최저"는 물가지수엔 사실상 통계 첫 달일 뿐이라 쓰지 않는다. */
function findRecentMinMax(series: Point[], months: number) {
  const recent = series.slice(-months);
  const max = recent.reduce((m, p) => (p.rate > m.rate ? p : m), recent[0]);
  const min = recent.reduce((m, p) => (p.rate < m.rate ? p : m), recent[0]);
  return { max, min };
}

/** 화폐가치 환산 요청 파라미터를 실제 데이터가 있는 시점으로 해석한다. "지금"은 항상 latest로 고정. */
function resolveMoneyRequest(params: SearchParams) {
  const fallbackFrom = shiftMonths(indexData.latest.date, -120);
  const from = resolveMonth(indexData.series, firstParam(params.from), fallbackFrom);

  const rawAmount = firstParam(params.amount);
  const parsedAmount = rawAmount ? Number(rawAmount) : NaN;
  const amount =
    Number.isFinite(parsedAmount) && parsedAmount > 0
      ? Math.round(parsedAmount)
      : KRW_BASE_AMOUNT;

  const hasQuery = Boolean(params.from || params.amount);
  return { from, amount, hasQuery };
}

function adjustmentMessage(
  adjustment: MonthAdjustment,
  resolvedDate: string,
): string | null {
  switch (adjustment.kind) {
    case "none":
      return null;
    case "clamped-min":
      return `요청하신 ${formatYM(adjustment.requested)}은 소비자물가지수 데이터 시작(${formatYM(resolvedDate)}) 이전이라, 비교 시점을 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "clamped-max":
      return `요청하신 ${formatYM(adjustment.requested)}은 아직 발표되지 않은 달이라, 비교 시점을 최신월 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "nearest":
      return `${formatYM(adjustment.requested)} 데이터가 없어 비교 시점을 가장 가까운 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "invalid":
      return adjustment.requested
        ? `입력하신 비교 시점(${adjustment.requested})을 읽을 수 없어 ${formatYM(resolvedDate)}로 대체했습니다.`
        : null;
  }
}

export const metadata: Metadata = {
  title: "소비자물가지수(CPI) 상승률 추이 — 전년동월비 (1966~현재)",
  description: `현재 소비자물가 전년동월비는 ${rateData.latest.rate}% (${rateData.latest.date} 기준). 1966년 이후 월별 물가 상승률 추이와 1990년 100만원이 지금 얼마인지 화폐가치 환산을 한 페이지에서 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `소비자물가 상승률 ${rateData.latest.rate}% (${rateData.latest.date})`,
    description: "1966년 이후 월별 소비자물가 전년동월비 시계열과 화폐가치 환산.",
    url: PAGE_URL,
    type: "article",
  },
};

export default async function CpiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { from, amount, hasQuery } = resolveMoneyRequest(params);
  const moneyResult = compareMoneyValue(from.point, indexData.latest, amount);
  const presets = buildMoneyPresets(indexData).map((preset) => {
    const presetFrom = resolveMonth(indexData.series, preset.fromYm, indexData.series[0].date);
    const presetResult = compareMoneyValue(presetFrom.point, indexData.latest, KRW_BASE_AMOUNT);
    return {
      ...preset,
      resolvedFrom: presetFrom,
      result: presetResult,
      href: `${PATH}?from=${presetFrom.point.date}&amount=${KRW_BASE_AMOUNT}#money-value`,
    };
  });

  const { series: rateSeries, latest: rateLatest, updatedAt, checkedAt } = rateData;
  const change = computeChange(rateSeries);
  const { max: recentMax, min: recentMin } = findRecentMinMax(rateSeries, 12);
  const startYear = rateSeries[0].date.slice(0, 4);
  const baseYear = indexData.baseYear;
  const yearlyProse = buildYearlyRateProse(rateSeries, "소비자물가 상승률");
  const checkedAtNote = checkedAt ? ` (원천 최종 확인일: ${checkedAt})` : "";

  const notices = [
    adjustmentMessage(from.adjustment, from.point.date),
  ].filter((v): v is string => v !== null);

  const historyLead =
    `${startYear}년 이후 월별 소비자물가 상승률(전년동월비)을 연·월 단위로 조회할 수 있습니다. ` +
    `${formatYM(rateLatest.date)} 기준 전년동월비는 ${fmtPercent(rateLatest.rate)}이며, ` +
    `최근 1년 중 가장 높았던 달은 ${formatYM(recentMax.date)} ${fmtPercent(recentMax.rate)}, ` +
    `가장 낮았던 달은 ${formatYM(recentMin.date)} ${fmtPercent(recentMin.rate)}였습니다.`;

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "소비자물가지수(CPI) 전년동월비 및 원지수 월별 시계열",
    description:
      "1965년 1월부터 현재까지의 소비자물가지수 원지수와 전년동월비. 국가데이터처 승인통계, 한국은행 ECOS Open API 경유 수집.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "국가데이터처" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: rateData.updatedAt,
    temporalCoverage: `${indexData.series[0].date}/${indexData.latest.date}`,
    measurementTechnique: "소비자물가지수 원지수 기반 전년동월비 산출",
    variableMeasured: "소비자물가 전년동월비(%), 소비자물가 원지수",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "소비자물가 상승률(전년동월비)은 어떻게 계산되나요?",
      a: "같은 달의 소비자물가 원지수를 1년 전과 비교한 변화율입니다. 예를 들어 이번 달 지수가 1년 전보다 3% 높으면 전년동월비는 3%입니다. 계절적 요인의 영향을 줄여 물가 흐름을 더 안정적으로 보여줍니다.",
    },
    {
      q: "왜 원지수가 아니라 전년동월비를 기준으로 보여주나요?",
      a: "원지수는 기준연도(예: 2020=100)가 바뀌는 지수 개편을 주기적으로 겪습니다. 개편이 있으면 지수 수준 자체가 재조정돼 과거 값과 단순 비교가 어려워지지만, 전년동월비(변화율)는 그 영향을 받지 않아 정본 지표로 씁니다. 원지수는 화폐가치 환산 등 특정 계산에만 보조적으로 사용합니다.",
    },
    {
      q: "소비자물가지수가 사상 최저였던 적이 있나요?",
      a: "소비자물가지수는 구조적으로 계속 상승하는 지표라 원지수의 '역대 최저'는 통계 작성 첫 달(1965년 1월)을 가리킬 뿐 의미 있는 비교가 아닙니다. 대신 물가가 오르는 속도(전년동월비)의 최근 고점·저점을 위 통계 카드에서 확인할 수 있습니다.",
    },
    {
      q: "기준연도(예: 2020=100)가 뭔가요? 개편되면 이 페이지는 어떻게 되나요?",
      a: "기준연도는 지수를 100으로 두는 비교 시점입니다. 통계청(현 국가데이터처)은 소비 구조 변화를 반영해 주기적으로 기준연도를 개편합니다. 개편이 반영되면 이 페이지는 신·구 기준이 섞이지 않도록 원지수를 전량 다시 적재하고, 화면과 화폐가치 환산 결과에 반영된 기준연도를 표시합니다.",
    },
    {
      q: "이 데이터는 얼마나 자주 갱신되나요?",
      a: `이 페이지는 한국은행 ECOS Open API를 통해 월 단위로 수집됩니다. 데이터 최종 변경일: ${updatedAt}${checkedAtNote}.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "데이터", item: `${BASE_URL}/data` },
      { "@type": "ListItem", position: 3, name: "소비자물가지수(CPI)", item: PAGE_URL },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CpiConvertRunTracker
        from={from.point.date}
        amount={amount}
        source={hasQuery ? "query" : "default"}
      />

      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <Link href="/data" className="hover:text-primary">데이터</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">소비자물가지수(CPI)</span>
        </nav>

        {/* Block 1: Hero */}
        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            소비자물가지수(CPI) 상승률
          </h1>
          <p className="mb-3 text-sm text-text-secondary">{historyLead}</p>
          <p className="mb-6 text-sm text-text-secondary">
            전년 같은 달과 비교한 소비자물가 변화율. 기준연도 개편의 영향을
            받지 않아 이 페이지의 정본 지표로 씁니다.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">현재 전년동월비</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {fmtPercent(rateLatest.rate)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(rateLatest.date)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">전월 대비</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  change > 0
                    ? "text-red-600"
                    : change < 0
                      ? "text-blue-600"
                      : "text-text-primary"
                }`}
              >
                {change === 0
                  ? "보합"
                  : `${change > 0 ? "+" : ""}${change.toFixed(2)}%p`}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">직전월 비교</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">최근 1년 최고</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {fmtPercent(recentMax.rate)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(recentMax.date)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">최근 1년 최저</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {fmtPercent(recentMin.rate)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(recentMin.date)}
              </p>
            </div>
          </div>

          <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary">
            <span>
              데이터 기준{" "}
              <strong className="font-semibold text-text-primary">
                {formatYM(rateLatest.date)}
              </strong>
            </span>
            <span aria-hidden>·</span>
            <span>
              {checkedAt
                ? `한국은행 ECOS 확인 ${checkedAt}`
                : `데이터 갱신 ${updatedAt}`}
            </span>
          </p>
        </section>

        {/* Block 2: 화폐가치 환산 — 하단이 아니라 히어로 바로 다음에 배치(스크롤 도달률 확보) */}
        <section
          id="money-value"
          className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-6"
        >
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            그때 돈이 지금 얼마일까 — 화폐가치 환산
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            소비자물가 원지수({baseYear ? `${baseYear}=100` : "지수"} 기준, 최신값{" "}
            {indexData.latest.rate})로 과거 금액의 현재 가치를 환산합니다. 결과가
            먼저 보이도록 기본값(10년 전 {fmtWon(KRW_BASE_AMOUNT)})으로 미리
            계산해 뒀습니다 — 아래에서 시점과 금액을 바꿔 다시 계산하세요.
          </p>

          {/* 결과 우선(입력은 아래) — 딥링크 도착 시 계산 결과가 바로 보이는 패턴 */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-5">
              <h3 className="mb-1 text-base font-semibold text-text-primary">
                그때 {fmtWon(moneyResult.amount)}, 지금 가치는?
              </h3>
              <p className="mb-4 text-xs text-text-secondary">
                {formatYM(moneyResult.from.date)}의 {fmtWon(moneyResult.amount)}이{" "}
                {formatYM(moneyResult.to.date)} 물가로 얼마인지.
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-text-secondary">
                    그때 ({formatYM(moneyResult.from.date)})
                  </dt>
                  <dd className="font-semibold text-text-primary">
                    {fmtWon(moneyResult.amount)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-text-secondary">
                    지금 ({formatYM(moneyResult.to.date)})
                  </dt>
                  <dd className="font-bold text-primary">
                    {fmtWon(moneyResult.thenAmountNowValue)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <dt className="text-text-secondary">누적 물가 상승률</dt>
                  <dd className="font-semibold text-red-600">
                    {fmtSignedPercent(moneyResult.changePercent)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-background p-5">
              <h3 className="mb-1 text-base font-semibold text-text-primary">
                지금 {fmtWon(moneyResult.amount)}은 그때 얼마?
              </h3>
              <p className="mb-4 text-xs text-text-secondary">
                역산 — 지금 {fmtWon(moneyResult.amount)}의 구매력을{" "}
                {formatYM(moneyResult.from.date)} 기준으로 환산.
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex items-baseline justify-between">
                  <dt className="text-text-secondary">
                    지금 ({formatYM(moneyResult.to.date)})
                  </dt>
                  <dd className="font-semibold text-text-primary">
                    {fmtWon(moneyResult.amount)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between">
                  <dt className="text-text-secondary">
                    그때 ({formatYM(moneyResult.from.date)})
                  </dt>
                  <dd className="font-bold text-primary">
                    {fmtWon(moneyResult.nowAmountThenValue)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-border pt-2">
                  <dt className="text-text-secondary">원지수 배율</dt>
                  <dd className="font-semibold text-text-primary">
                    ×{moneyResult.ratio.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {notices.length > 0 && (
            <div className="mb-4 rounded-md border border-amber-400/50 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              {notices.map((notice, i) => (
                <p key={i}>⚠ {notice}</p>
              ))}
            </div>
          )}

          <form
            method="GET"
            action={`${PATH}#money-value`}
            className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-3"
          >
            <label className="text-xs text-text-secondary">
              그때 시점
              <input
                type="month"
                name="from"
                defaultValue={from.point.date}
                min={indexData.series[0].date}
                max={indexData.latest.date}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-xs text-text-secondary">
              금액(원)
              <input
                type="number"
                name="amount"
                defaultValue={amount}
                min={1}
                step={1}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <button
              type="submit"
              className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              환산하기
            </button>
          </form>
          <p className="mt-3 text-[11px] text-text-secondary">
            선택 가능한 구간은 {formatYM(indexData.series[0].date)}부터입니다.
            범위를 벗어난 요청은 가장 가까운 달로 보정하고 위에 표시합니다.
          </p>

          <div className="mt-6 space-y-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {preset.label} · {formatYM(preset.resolvedFrom.point.date)}
                  </h3>
                  <span className="text-[11px] text-text-secondary">
                    {preset.note}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {formatYM(preset.resolvedFrom.point.date)}의{" "}
                  {KRW_BASE_AMOUNT.toLocaleString("ko-KR")}원은 지금 가치로 약{" "}
                  <strong className="text-text-primary">
                    {fmtWon(preset.result.thenAmountNowValue)}
                  </strong>
                  입니다 ({fmtSignedPercent(preset.result.changePercent)} 누적
                  상승).
                </p>
                {preset.resolvedFrom.adjustment.kind !== "none" && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    ⚠{" "}
                    {adjustmentMessage(
                      preset.resolvedFrom.adjustment,
                      preset.resolvedFrom.point.date,
                    )}
                  </p>
                )}
                <p className="mt-2">
                  <Link
                    href={preset.href}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    이 시점으로 환산하기 →
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 3: Chart */}
        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            소비자물가 전년동월비 추이
          </h2>
          <RateChart
            series={rateSeries}
            label="전년동월비"
            color="#ea580c"
            interpolation="monotone"
          />
          <p className="mt-3 text-[11px] text-text-secondary">
            출처: 한국은행 ECOS · 데이터 갱신 {updatedAt}
            {checkedAt && ` · 원천 확인 ${checkedAt}`}
          </p>
        </section>

        <div className="mb-8">
          <AdSlot type="inline" />
        </div>

        {/* Block 4: Narrative */}
        <section className="mb-8 space-y-4 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-lg font-semibold text-text-primary">
            지금 물가 상승률이 의미하는 것
          </h2>
          <p>
            {formatYM(rateLatest.date)} 현재 소비자물가 전년동월비는{" "}
            <strong className="text-text-primary">
              {fmtPercent(rateLatest.rate)}
            </strong>
            입니다. 1966년 이후 평균{" "}
            <strong className="text-text-primary">
              {fmtPercent(rateData.stats.average)}
            </strong>
            과 비교하면 {Math.abs(rateLatest.rate - rateData.stats.average).toFixed(2)}
            %p {rateLatest.rate > rateData.stats.average ? "높은" : "낮은"}{" "}
            수준입니다.
          </p>
          <p>
            전년동월비는 기준연도가 바뀌어도(2026년 12월 기준연도 개편 예정) 값이
            흔들리지 않는 지표라 이 페이지의 정본으로 씁니다. 원지수(
            {baseYear ? `${baseYear}=100` : "지수"})는 화폐가치 환산 등 특정
            계산에서만 보조적으로 사용합니다.
          </p>
          <p>
            물가가 오르면 같은 돈으로 살 수 있는 것이 줄어듭니다. 1990년
            100만원이 지금 얼마인지{" "}
            <TrackedCtaLink
              href={`${PATH}#money-value`}
              className="font-medium text-primary hover:underline"
              eventName="cta_click"
              eventParams={{
                page: "prices_cpi",
                target: "money-value-section",
                position: "inline",
              }}
            >
              화폐가치 환산으로 바로 확인
            </TrackedCtaLink>
            해 보세요.
          </p>
        </section>

        {/* Block 5: 연도별 평균 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            연도별 평균 전년동월비
          </h2>
          <YearlyAverageTable series={rateSeries} label="전년동월비" />
        </section>

        {/* Block 6: Table */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 소비자물가 전년동월비
          </h2>
          <RateTable series={rateSeries} label="전년동월비" />
        </section>

        {/* Block 7: 연도별 프로즈 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            연도별 물가 상승률 변동
          </h2>
          <div className="space-y-4">
            {yearlyProse.map((y) => (
              <div key={y.year}>
                <h3 className="mb-1 text-sm font-semibold text-text-primary">
                  {y.heading}
                </h3>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {y.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 8: FAQ */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            자주 묻는 질문
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-lg border border-border bg-background p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Block 9: Calculator CTA */}
        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            물가 상승, 내 자산 계획에 반영해보세요
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            물가가 오르는 만큼 자산도 불어나야 실질 가치가 유지됩니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <TrackedCtaLink
              href="/finance/compound-interest"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              eventName="cta_click"
              eventParams={{ page: "prices_cpi", target: "compound-interest", position: "bottom" }}
            >
              복리 계산기
            </TrackedCtaLink>
            <TrackedCtaLink
              href="/data/rates/base"
              className="rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
              eventName="cta_click"
              eventParams={{ page: "prices_cpi", target: "rates_base", position: "bottom" }}
            >
              기준금리 추이 보기
            </TrackedCtaLink>
          </div>
        </section>

        {/* Block 10: Sources */}
        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 출처 및 면책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              원 통계 생산: 국가데이터처(구 통계청) 승인통계 · 수집 경로: 한국은행
              경제통계시스템(ECOS) ·{" "}
              <a
                href="https://ecos.bok.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ecos.bok.or.kr
              </a>
            </li>
            <li>
              집계 단위: 소비자물가지수 총지수(전 품목) 월별{" "}
              {baseYear ? `(${baseYear}=100)` : ""}
            </li>
            <li>데이터 최종 변경일: {updatedAt}</li>
            {checkedAt && <li>원천 최종 확인일: {checkedAt}</li>}
            <li>
              화폐가치 환산은 소비자물가 원지수만 반영합니다. 실제 자산·소득의
              구매력은 개인의 소비 구조에 따라 다를 수 있습니다.
            </li>
            <li>
              본 데이터는 참고용입니다. 투자 등 실제 의사결정 시 국가데이터처·
              한국은행 공식 자료를 반드시 확인하세요.
            </li>
          </ul>
          <p className="mt-3">
            <Link href="/data-sources" className="text-primary hover:underline">
              Tooly 전체 데이터 출처 →
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
