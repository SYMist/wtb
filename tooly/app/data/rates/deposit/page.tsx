import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import depositData from "@/lib/data/deposit-rate-series.json";
import baseData from "@/lib/data/base-rate-series.json";
import RateChart from "../../_components/RateChart";
import RateTable from "../../_components/RateTable";

type Point = { date: string; rate: number };
type SeriesData = {
  series: Point[];
  latest: Point;
  stats: {
    max: { date: string; rate: number };
    min: { date: string; rate: number };
    average: number;
  };
  updatedAt: string;
};

const data = depositData as SeriesData;
const base = baseData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/rates/deposit";

export const metadata: Metadata = {
  title: "정기예금 평균 금리 추이 (신규취급액 기준)",
  description: `${data.latest.date} 기준 예금은행 정기예금 신규취급액 가중평균금리는 ${data.latest.rate}%. 2001년 이후 월별 추이와 기준금리 스프레드를 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `정기예금 평균 금리 ${data.latest.rate}% (${data.latest.date})`,
    description: "예금은행 정기예금 신규취급액 가중평균금리 시계열.",
    url: PAGE_URL,
    type: "article",
  },
};

function formatYM(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}년 ${parseInt(m, 10)}월`;
}

function computeChange(series: Point[]) {
  if (series.length < 2) return 0;
  return series[series.length - 1].rate - series[series.length - 2].rate;
}

function findMatchingBase(ym: string): number | null {
  const found = base.series.find((p) => p.date === ym);
  return found ? found.rate : null;
}

export default function DepositRatePage() {
  const { series, latest, stats, updatedAt } = data;
  const change = computeChange(series);
  const baseAtLatest = findMatchingBase(latest.date);
  const spread = baseAtLatest !== null ? latest.rate - baseAtLatest : null;

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "예금은행 정기예금 신규취급액 가중평균금리",
    description:
      "한국은행 ECOS 121Y013 (BEABAB2111) — 예금은행 정기예금 신규취급액 가중평균금리 월별 시계열.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "한국은행" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: updatedAt,
    temporalCoverage: `${series[0].date}/${latest.date}`,
    measurementTechnique: "신규취급액 가중평균",
    variableMeasured: "정기예금 금리 (%)",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "이 금리는 어떻게 산출되나요?",
      a: "예금은행이 해당 월에 신규로 받은 정기예금의 가중평균금리입니다. 만기·금액별 비중에 따라 평균이 결정되므로 특정 상품의 표시금리와는 다를 수 있습니다.",
    },
    {
      q: "내가 가입할 수 있는 정기예금 금리와 왜 다른가요?",
      a: "이 수치는 시중은행 평균이며, 실제 가입 금리는 만기(6개월~3년), 가입 금액, 우대조건(첫 거래·자동이체·카드 사용 등)에 따라 평균 대비 ±0.5%p 이상 편차가 있습니다. 인터넷전문은행과 저축은행은 별도 통계입니다.",
    },
    {
      q: "기준금리와 정기예금 금리의 관계는?",
      a: "기준금리가 오르면 정기예금 금리도 통상 1~3개월 시차로 따라 오릅니다. 다만 은행은 예금 유치 경쟁 강도, 자금 조달 필요성에 따라 인상 폭과 시점을 조정합니다.",
    },
    {
      q: "정기예금 금리가 떨어질 때 어떻게 대응해야 하나요?",
      a: "금리 인하 사이클이 시작되면 인하 전 장기 정기예금(2~3년)에 가입해 현재 금리를 잠그는 전략이 유효합니다. 반대로 인상 사이클에서는 단기로 굴리며 갈아타는 편이 유리합니다.",
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
      { "@type": "ListItem", position: 1, name: "홈", item: "https://tooly.deluxo.co.kr" },
      { "@type": "ListItem", position: 2, name: "데이터", item: "https://tooly.deluxo.co.kr/data" },
      { "@type": "ListItem", position: 3, name: "금리", item: "https://tooly.deluxo.co.kr/data/rates" },
      { "@type": "ListItem", position: 4, name: "정기예금 금리", item: PAGE_URL },
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

      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span>데이터</span>
          <span className="mx-1">/</span>
          <Link href="/data/rates" className="hover:text-primary">금리</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">정기예금 금리</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            정기예금 평균 금리
          </h1>
          <p className="mb-6 text-sm text-text-secondary">
            예금은행이 해당 월에 신규로 받은 정기예금의 가중평균금리. 시중 예금 시장 전반의 흐름을 보여주는 핵심 지표.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">현재</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {latest.rate}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(latest.date)}
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
              <p className="mt-1 text-[11px] text-text-secondary">
                직전월 비교
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">기준금리 스프레드</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {spread !== null
                  ? `${spread > 0 ? "+" : ""}${spread.toFixed(2)}%p`
                  : "-"}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                정기예금 − 기준금리
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">장기 평균</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {stats.average}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {series[0].date} ~
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            정기예금 금리 추이
          </h2>
          <RateChart
            series={series}
            label="정기예금 금리"
            color="#0891b2"
            interpolation="monotone"
          />
          <p className="mt-3 text-[11px] text-text-secondary">
            출처: 한국은행 ECOS · 갱신: {updatedAt}
          </p>
        </section>

        <div className="mb-8">
          <AdSlot type="inline" />
        </div>

        <section className="mb-8 space-y-4 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-lg font-semibold text-text-primary">
            지금 정기예금 금리가 의미하는 것
          </h2>
          <p>
            {formatYM(latest.date)} 정기예금 평균 금리는{" "}
            <strong className="text-text-primary">{latest.rate}%</strong>
            입니다.{" "}
            {spread !== null ? (
              <>
                같은 기간 한국은행 기준금리({baseAtLatest}%) 대비 스프레드는{" "}
                <strong className="text-text-primary">
                  {spread > 0 ? "+" : ""}
                  {spread.toFixed(2)}%p
                </strong>
                . 이는 은행이 자금 조달 비용을 어떻게 설정하고 있는지를 보여주는
                핵심 지표입니다.
              </>
            ) : (
              <>기준금리 데이터와 매칭 가능한 구간이 부족합니다.</>
            )}
          </p>
          <p>
            역대 최고는 {formatYM(stats.max.date)}의{" "}
            <strong className="text-text-primary">{stats.max.rate}%</strong>,
            최저는 {formatYM(stats.min.date)}의{" "}
            <strong className="text-text-primary">{stats.min.rate}%</strong>
            였습니다. 인플레이션이 높을수록, 또 은행 간 예금 유치 경쟁이 치열할수록 평균 금리가 상승하는 경향이 있습니다.
          </p>
          <p>
            실제 가입 금리는 만기·금액·우대조건에 따라 평균 대비 ±0.5%p 이상 차이가 날 수 있습니다. 신규 가입 시 본인이 받는 금리가 평균 대비 어디쯤 위치하는지 비교해 보세요.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 정기예금 금리
          </h2>
          <RateTable series={series} label="정기예금 금리" />
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

        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            이 금리로 내 예금 이자를 계산해보세요
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            현재 평균 {latest.rate}%를 기준으로 만기 시 받을 이자와 세후 수령액을 계산할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/finance/compound-interest?rate=${latest.rate}`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              복리 계산기
            </Link>
            <Link
              href="/data/rates/base"
              className="rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              기준금리 추이 보기
            </Link>
            <Link
              href="/data/rates"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              전체 금리 데이터
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 출처 및 면책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              원천: 한국은행 ECOS · 통계 121Y013 (예금은행 수신금리, 신규취급액 기준) · 항목 BEABAB2111 (정기예금)
            </li>
            <li>집계 단위: 월별 가중평균</li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              실제 가입 금리는 만기·금액·우대조건에 따라 편차가 큽니다. 가입 전 각 은행 공시 금리를 반드시 확인하세요.
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
