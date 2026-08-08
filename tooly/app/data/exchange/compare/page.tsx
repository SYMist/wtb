import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import usdkrwData from "@/lib/data/usdkrw-rate-series.json";
import jpykrwData from "@/lib/data/jpykrw-rate-series.json";
import cnykrwData from "@/lib/data/cnykrw-rate-series.json";
import eurkrwData from "@/lib/data/eurkrw-rate-series.json";
import {
  CURRENCIES,
  CURRENCY_CODES,
  KRW_BASE_AMOUNT,
  buildPresets,
  compareRates,
  defaultRange,
  firstParam,
  josa,
  parseCurrency,
  resolveMonth,
  type CurrencyCode,
  type CurrencyMeta,
  type MonthAdjustment,
  type SeriesData,
} from "@/lib/data/exchange-compare";
import RateChart from "../../_components/RateChart";
import YearlyAverageTable from "../../_components/YearlyAverageTable";
import TrackedCtaLink from "../../_components/TrackedCtaLink";
import CompareRunTracker from "../../_components/CompareRunTracker";

const DATA: Record<CurrencyCode, SeriesData> = {
  usd: usdkrwData as SeriesData,
  jpy: jpykrwData as SeriesData,
  cny: cnykrwData as SeriesData,
  eur: eurkrwData as SeriesData,
};

const BASE_URL = "https://tooly.deluxo.co.kr";
const PATH = "/data/exchange/compare";

type SearchParams = Record<string, string | string[] | undefined>;

const fmtWon = (v: number) =>
  `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
const fmtSignedWon = (v: number) =>
  `${v > 0 ? "+" : ""}${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
const fmtSignedPercent = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
const fmtForeign = (v: number, meta: CurrencyMeta) =>
  `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${meta.unitName}`;
const fmtSignedForeign = (v: number, meta: CurrencyMeta) =>
  `${v > 0 ? "+" : ""}${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}${meta.unitName}`;

// 통화가 바뀌면 조사도 바뀐다(달러는/엔은, 유로로/위안으로) — 문자열에서 판정한다.
const withRo = (s: string) => `${s}${josa(s, "로")}`;
const withEul = (s: string) => `${s}${josa(s, "을를")}`;
const withEun = (s: string) => `${s}${josa(s, "은는")}`;
const withI = (s: string) => `${s}${josa(s, "이가")}`;

function formatYM(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

/**
 * 요청 파라미터를 실제 데이터가 있는 두 시점으로 해석한다.
 * 통화마다 시계열 시작월이 다르므로(USD·JPY 1980-01 / EUR 1999-01 / CNY 2006-01)
 * 클램프는 통화별로 일어나고, 보정 사실은 화면에 그대로 표시한다.
 */
function resolveRequest(params: SearchParams) {
  const cur = parseCurrency(params.cur);
  const meta = CURRENCIES[cur];
  const data = DATA[cur];
  const fallback = defaultRange(data);

  const from = resolveMonth(data.series, firstParam(params.from), fallback.from);
  const to = resolveMonth(data.series, firstParam(params.to), fallback.to);
  const hasQuery = Boolean(params.cur || params.from || params.to);

  return { cur, meta, data, from, to, hasQuery };
}

function adjustmentMessage(
  adjustment: MonthAdjustment,
  resolvedDate: string,
  role: "시작" | "종료",
  meta: CurrencyMeta,
): string | null {
  switch (adjustment.kind) {
    case "none":
      return null;
    case "clamped-min":
      return `요청하신 ${formatYM(adjustment.requested)}은 ${meta.name} 데이터 시작(${formatYM(resolvedDate)}) 이전이라, ${role} 시점을 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "clamped-max":
      return `요청하신 ${formatYM(adjustment.requested)}은 아직 발표되지 않은 달이라, ${role} 시점을 최신월 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "nearest":
      return `${formatYM(adjustment.requested)} 데이터가 없어 ${role} 시점을 가장 가까운 ${formatYM(resolvedDate)}로 보정했습니다.`;
    case "invalid":
      return adjustment.requested
        ? `입력하신 ${role} 시점(${adjustment.requested})을 읽을 수 없어 ${formatYM(resolvedDate)}로 대체했습니다.`
        : null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { cur, meta, data, from, to } = resolveRequest(await searchParams);
  const result = compareRates(from.point, to.point, meta);

  // 캐노니컬은 통화당 1개(총 4개)로 고정한다. 두 시점 조합은 같은 페이지의 쿼리
  // 변형일 뿐이므로 559×559개 URL이 색인에 쌓이면 안 된다("조합 URL 양산 금지").
  const canonical = cur === "usd" ? `${BASE_URL}${PATH}` : `${BASE_URL}${PATH}?cur=${cur}`;

  return {
    title: `${meta.name} 환율 시점 비교 — 그때 금액이 지금 얼마?`,
    description: `${formatYM(from.point.date)} ${fmtWon(from.point.rate)} → ${formatYM(to.point.date)} ${fmtWon(to.point.rate)}(${fmtSignedPercent(result.changePercent)}). ${data.series[0].date.slice(0, 4)}년 이후 ${meta.name} 환율을 두 시점으로 비교하고 그때 금액의 현재 가치를 환산합니다.`,
    alternates: { canonical },
    openGraph: {
      title: `${meta.name} ${formatYM(from.point.date)} vs ${formatYM(to.point.date)}`,
      description: `${fmtWon(from.point.rate)} → ${fmtWon(to.point.rate)} (${fmtSignedWon(result.diff)}, ${fmtSignedPercent(result.changePercent)})`,
      url: canonical,
      type: "article",
    },
  };
}

export default async function ExchangeComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { cur, meta, data, from, to, hasQuery } = resolveRequest(params);
  const result = compareRates(from.point, to.point, meta);
  const { series, latest, updatedAt } = data;
  const checkedAt = data.checkedAt;
  const startYear = series[0].date.slice(0, 4);

  const notices = [
    adjustmentMessage(from.adjustment, from.point.date, "시작", meta),
    adjustmentMessage(to.adjustment, to.point.date, "종료", meta),
  ].filter((v): v is string => v !== null);

  // 비교 구간만 잘라낸 차트 — 시계열 전체가 아니라 "이 두 시점 사이"를 보여준다.
  const [windowStart, windowEnd] =
    from.point.date <= to.point.date
      ? [from.point.date, to.point.date]
      : [to.point.date, from.point.date];
  const windowSeries = series.filter(
    (p) => p.date >= windowStart && p.date <= windowEnd,
  );

  const presets = buildPresets(data).map((preset) => {
    const presetFrom = resolveMonth(series, preset.fromYm, series[0].date);
    const presetResult = compareRates(presetFrom.point, latest, meta);
    return {
      ...preset,
      resolvedFrom: presetFrom,
      result: presetResult,
      href: `${PATH}?cur=${cur}&from=${presetFrom.point.date}&to=${latest.date}`,
    };
  });

  const heroLead = `${startYear}년 이후 ${meta.name} 환율을 두 시점으로 비교하고, 그때의 금액이 지금 얼마인지 환산합니다. ${formatYM(from.point.date)} ${fmtWon(from.point.rate)} → ${formatYM(to.point.date)} ${fmtWon(to.point.rate)}(${fmtSignedWon(result.diff)}, ${fmtSignedPercent(result.changePercent)}).`;

  const faq = [
    {
      q: "‘그때 금액이 지금 얼마’는 물가 기준인가요?",
      a: "아닙니다. 이 페이지는 환율만으로 환산합니다. 같은 외화 금액이 두 시점에 각각 몇 원인지, 같은 원화가 각각 몇 외화인지를 보여줍니다. 국내 물가 상승률(인플레이션)은 반영하지 않으므로, 해외 지출·환전 관점의 비교로 보시면 됩니다.",
    },
    {
      q: "원/엔은 왜 100엔 단위인가요?",
      a: "한국은행 ECOS가 원/일본엔 환율을 100엔당 원화로 고시하기 때문입니다. 이 페이지도 같은 기준(100엔당)으로 표시하고, 환산할 때 내부적으로 100엔 단위를 반영합니다. 1엔 기준으로 보려면 표시값을 100으로 나누면 됩니다.",
    },
    {
      q: "환율 변화율과 원화 구매력 변화율이 왜 다른가요?",
      a: "분모가 다르기 때문입니다. 환율이 1,111.68원에서 1,497.43원으로 +34.70% 올랐을 때, 같은 원화로 살 수 있는 달러는 -25.76% 줄어듭니다(1,111.68 ÷ 1,497.43 − 1). 부호만 뒤집은 −34.70%는 틀린 값입니다.",
    },
    {
      q: "선택할 수 있는 기간이 통화마다 다른 이유는?",
      a: "원천 데이터의 시작월이 다릅니다. 원/달러·원/엔은 1980년 1월부터, 원/유로는 1999년 1월(유로 도입), 원/위안은 2006년 1월부터 제공됩니다. 시작 이전 시점을 요청하면 시작월로 보정하고, 보정했다는 사실을 화면에 표시합니다.",
    },
    {
      q: "이 환율로 실제 환전이 되나요?",
      a: "월평균 매매기준율이라 실제 환전 금액과는 다릅니다. 은행 현찰 환율에는 스프레드·수수료가 붙고, 실시간 환율은 분 단위로 움직입니다. 실제 환전 계획에는 당일 고시 환율을 확인하세요.",
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
      { "@type": "ListItem", position: 2, name: "데이터", item: `${BASE_URL}/data/exchange` },
      { "@type": "ListItem", position: 3, name: "환율", item: `${BASE_URL}/data/exchange` },
      { "@type": "ListItem", position: 4, name: "시점 비교", item: `${BASE_URL}${PATH}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <CompareRunTracker
        cur={cur}
        from={from.point.date}
        to={to.point.date}
        source={hasQuery ? "query" : "default"}
      />

      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span>데이터</span>
          <span className="mx-1">/</span>
          <Link href="/data/exchange" className="hover:text-primary">환율</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">시점 비교</span>
        </nav>

        {/* Block 1: Hero — 네이버 스니펫은 meta description을 무시하고 본문 최상단
            텍스트를 DOM 순서대로 긁는다. 그래서 첫 문단이 값을 포함한 프로즈여야 하고,
            신선도 배지는 통계카드 뒤로 보낸다(8/08 base 페이지에서 검증된 순서). */}
        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            {meta.name} 환율 시점 비교
          </h1>
          <p className="mb-3 text-sm text-text-secondary">{heroLead}</p>
          <p className="mb-6 text-sm text-text-secondary">
            두 시점의 월평균 매매기준율을 나란히 놓고, 그때 쓴 외화 금액이 지금
            몇 원인지 · 같은 원화가 그때와 지금 각각 몇 {meta.unitName}인지를
            계산합니다. 한국은행 ECOS 월평균 기준이며, {meta.quoteLabel} 원화
            금액으로 표기합니다.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">그때</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {fmtWon(from.point.rate)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(from.point.date)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">지금</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {fmtWon(to.point.rate)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(to.point.date)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">변화</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  result.diff > 0
                    ? "text-red-600"
                    : result.diff < 0
                      ? "text-blue-600"
                      : "text-text-primary"
                }`}
              >
                {result.diff === 0 ? "보합" : fmtSignedPercent(result.changePercent)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {result.diff === 0 ? "동일" : fmtSignedWon(result.diff)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">원화 구매력</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  result.krwFixed.purchasingPowerPercent > 0
                    ? "text-blue-600"
                    : result.krwFixed.purchasingPowerPercent < 0
                      ? "text-red-600"
                      : "text-text-primary"
                }`}
              >
                {fmtSignedPercent(result.krwFixed.purchasingPowerPercent)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                같은 원화로 살 수 있는 {meta.unitName}
              </p>
            </div>
          </div>

          {/* 신선도 — 통계카드 뒤. 데이터 기준월과 원천 확인일은 다른 값이라 둘 다 노출한다. */}
          <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary">
            <span>
              데이터 기준{" "}
              <strong className="font-semibold text-text-primary">
                {formatYM(latest.date)}
              </strong>
            </span>
            <span aria-hidden>·</span>
            <span>
              {checkedAt
                ? `한국은행 ECOS 확인 ${checkedAt}`
                : `데이터 갱신 ${updatedAt}`}
            </span>
            <span aria-hidden>·</span>
            <span>
              수록 구간 {formatYM(series[0].date)} ~ {formatYM(latest.date)}
            </span>
          </p>

          {/* 보정 표시 — 조용히 다른 달을 보여주지 않는다. */}
          {notices.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-400/50 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              {notices.map((notice, i) => (
                <p key={i}>⚠ {notice}</p>
              ))}
            </div>
          )}
        </section>

        {/* Block 2: 비교 입력 — 클라이언트 상태가 아니라 GET 폼이다.
            제출하면 URL이 바뀌고 서버가 다시 그린다(공유·색인 가능한 결과). */}
        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            두 시점 직접 고르기
          </h2>
          <form method="GET" action={PATH} className="grid gap-3 sm:grid-cols-4">
            <label className="text-xs text-text-secondary">
              통화
              <select
                name="cur"
                defaultValue={cur}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {CURRENCIES[code].name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-text-secondary">
              시작 시점
              <input
                type="month"
                name="from"
                defaultValue={from.point.date}
                min={series[0].date}
                max={latest.date}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-xs text-text-secondary">
              종료 시점
              <input
                type="month"
                name="to"
                defaultValue={to.point.date}
                min={series[0].date}
                max={latest.date}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <button
              type="submit"
              className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              비교하기
            </button>
          </form>
          <p className="mt-3 text-[11px] text-text-secondary">
            선택 가능한 구간은 통화마다 다릅니다 — {withEun(meta.name)}{" "}
            {formatYM(series[0].date)}부터. 범위를 벗어난 요청은 가장 가까운
            달로 보정하고 위에 표시합니다.
          </p>
        </section>

        {/* Block 3: 결과 카드 2종 */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="mb-1 text-base font-semibold text-text-primary">
              외화 고정 — {withEun(fmtForeign(result.foreignFixed.amount, meta))} 얼마?
            </h2>
            <p className="mb-4 text-xs text-text-secondary">
              같은 {withEul(fmtForeign(result.foreignFixed.amount, meta))} 두 시점에
              원화로 환산.
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-text-secondary">
                  그때 ({formatYM(from.point.date)})
                </dt>
                <dd className="font-semibold text-text-primary">
                  {fmtWon(result.foreignFixed.thenKrw)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-text-secondary">
                  지금 ({formatYM(to.point.date)})
                </dt>
                <dd className="font-bold text-primary">
                  {fmtWon(result.foreignFixed.nowKrw)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <dt className="text-text-secondary">차이</dt>
                <dd
                  className={`font-semibold ${
                    result.foreignFixed.diffKrw > 0
                      ? "text-red-600"
                      : result.foreignFixed.diffKrw < 0
                        ? "text-blue-600"
                        : "text-text-primary"
                  }`}
                >
                  {fmtSignedWon(result.foreignFixed.diffKrw)} (
                  {fmtSignedPercent(result.changePercent)})
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="mb-1 text-base font-semibold text-text-primary">
              원화 고정 — {KRW_BASE_AMOUNT.toLocaleString("ko-KR")}원의 구매력
            </h2>
            <p className="mb-4 text-xs text-text-secondary">
              같은 {KRW_BASE_AMOUNT.toLocaleString("ko-KR")}원으로 바꿀 수 있는{" "}
              {meta.unitName} 금액.
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between">
                <dt className="text-text-secondary">
                  그때 ({formatYM(from.point.date)})
                </dt>
                <dd className="font-semibold text-text-primary">
                  {fmtForeign(result.krwFixed.thenForeign, meta)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-text-secondary">
                  지금 ({formatYM(to.point.date)})
                </dt>
                <dd className="font-bold text-primary">
                  {fmtForeign(result.krwFixed.nowForeign, meta)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-2">
                <dt className="text-text-secondary">차이</dt>
                <dd
                  className={`font-semibold ${
                    result.krwFixed.diffForeign > 0
                      ? "text-blue-600"
                      : result.krwFixed.diffForeign < 0
                        ? "text-red-600"
                        : "text-text-primary"
                  }`}
                >
                  {fmtSignedForeign(result.krwFixed.diffForeign, meta)} (
                  {fmtSignedPercent(result.krwFixed.purchasingPowerPercent)})
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mb-8 space-y-3 rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-base font-semibold text-text-primary">
            이 결과를 읽는 법
          </h2>
          <p>
            {formatYM(from.point.date)}에{" "}
            {withEul(fmtForeign(result.foreignFixed.amount, meta))} 쓰려면 {fmtWon(result.foreignFixed.thenKrw)}이 필요했고, 같은 금액이{" "}
            {formatYM(to.point.date)}에는 {fmtWon(result.foreignFixed.nowKrw)}입니다.
            반대로 {KRW_BASE_AMOUNT.toLocaleString("ko-KR")}원은{" "}
            {fmtForeign(result.krwFixed.thenForeign, meta)}에서{" "}
            {withRo(fmtForeign(result.krwFixed.nowForeign, meta))} 바뀌었습니다.
          </p>
          <p>
            환율은 {fmtSignedPercent(result.changePercent)} 변했지만 원화 구매력은{" "}
            {fmtSignedPercent(result.krwFixed.purchasingPowerPercent)}입니다.
            분모가 다르기 때문에 두 숫자는 부호만 뒤집은 값이 아닙니다 — 환율이
            오를 때 구매력 감소폭은 상승률보다 작고, 환율이 내릴 때 구매력
            증가폭은 하락률보다 큽니다.
          </p>
          <p>
            실제 환전 금액이 궁금하다면{" "}
            <TrackedCtaLink
              href="/convert/currency-converter"
              className="font-medium text-primary hover:underline"
              eventName="cta_click"
              eventParams={{
                page: "exchange_compare",
                target: "currency-converter",
                position: "inline",
              }}
            >
              환율 변환기
            </TrackedCtaLink>
            에서 현재 환율로 바로 계산해 보세요.
          </p>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            {formatYM(windowStart)} ~ {formatYM(windowEnd)} 흐름
          </h2>
          <RateChart
            series={windowSeries}
            label={meta.name}
            color="#059669"
            interpolation="monotone"
            defaultRange="ALL"
            format={{
              unit: "원",
              useCommas: true,
              precision: 2,
              tickPrecision: 0,
              hideTickUnit: true,
            }}
          />
          <p className="mt-3 text-[11px] text-text-secondary">
            선택 구간 {windowSeries.length}개월 · 출처: 한국은행 ECOS · 갱신:{" "}
            {updatedAt}
          </p>
        </section>

        <div className="mb-8">
          <AdSlot type="inline" />
        </div>

        {/* Block 4: 프리셋 6블록 — 날짜는 전부 latest·stats에서 파생한다. */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            자주 찾는 비교 시점 ({formatYM(latest.date)} 기준)
          </h2>
          <div className="space-y-3">
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
                  {meta.name} 환율은{" "}
                  {formatYM(preset.resolvedFrom.point.date)}{" "}
                  {fmtWon(preset.resolvedFrom.point.rate)}에서{" "}
                  {formatYM(latest.date)} {withRo(fmtWon(latest.rate))}{" "}
                  {fmtSignedWon(preset.result.diff)}(
                  {fmtSignedPercent(preset.result.changePercent)}) 움직였습니다.
                  같은 {withI(fmtForeign(preset.result.foreignFixed.amount, meta))}{" "}
                  {fmtWon(preset.result.foreignFixed.thenKrw)}에서{" "}
                  {fmtWon(preset.result.foreignFixed.nowKrw)}이 되고,{" "}
                  {KRW_BASE_AMOUNT.toLocaleString("ko-KR")}원의 구매력은{" "}
                  {fmtForeign(preset.result.krwFixed.thenForeign, meta)}에서{" "}
                  {withRo(fmtForeign(preset.result.krwFixed.nowForeign, meta))}{" "}
                  {fmtSignedPercent(preset.result.krwFixed.purchasingPowerPercent)}{" "}
                  변했습니다.
                </p>
                {preset.resolvedFrom.adjustment.kind !== "none" && (
                  <p className="mt-2 text-[11px] text-amber-700">
                    ⚠{" "}
                    {adjustmentMessage(
                      preset.resolvedFrom.adjustment,
                      preset.resolvedFrom.point.date,
                      "시작",
                      meta,
                    )}
                  </p>
                )}
                <p className="mt-2">
                  <Link
                    href={preset.href}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    이 구간으로 비교하기 →
                  </Link>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Block 5: 연도별 평균 비교표 */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            연도별 평균 {meta.name} 환율
          </h2>
          <YearlyAverageTable
            series={series}
            label={meta.name}
            unit="원"
            changeUnit="원"
          />
        </section>

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

        {/* Block 6: 내부링크 — 4종 시계열 각각 */}
        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            통화별 전체 시계열 보기
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            각 통화의 월별 전체 시계열과 국면별 해설은 개별 데이터 페이지에
            있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {CURRENCY_CODES.map((code) => (
              <Link
                key={code}
                href={CURRENCIES[code].seriesPath}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
              >
                {CURRENCIES[code].name} 추이
              </Link>
            ))}
            <TrackedCtaLink
              href="/convert/currency-converter"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              eventName="cta_click"
              eventParams={{
                page: "exchange_compare",
                target: "currency-converter",
                position: "bottom",
              }}
            >
              현재 환율로 환전 계산
            </TrackedCtaLink>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 출처 및 면책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              원천: 한국은행 ECOS · 통계 731Y004 (주요국 통화의 대원화환율) ·
              평균자료 항목
            </li>
            <li>
              집계 단위: 월평균 매매기준율 · 원/일본엔은 ECOS 고시와 동일하게
              100엔당 원화
            </li>
            <li>
              수록 구간: 원/달러·원/엔 1980-01~, 원/유로 1999-01~, 원/위안
              2006-01~
            </li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              환산은 환율만 반영하며 국내 물가 상승률은 포함하지 않습니다. 실제
              환전 시에는 은행 스프레드·수수료가 추가됩니다.
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
