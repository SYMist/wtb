import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import baseRateData from "@/lib/data/base-rate-series.json";
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

const data = baseRateData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/rates/base";

export const metadata: Metadata = {
  title: "한국은행 기준금리 추이 (2000~현재)",
  description: `현재 한국은행 기준금리는 ${data.latest.rate}% (${data.latest.date} 기준). 2000년 이후 월별 기준금리 추이, 역대 최고·최저, 통계를 한눈에 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `한국은행 기준금리 ${data.latest.rate}% (${data.latest.date})`,
    description: "2000년 이후 월별 기준금리 시계열 데이터.",
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

function findPeak(series: Point[]) {
  const lastFive = series.slice(-60);
  return lastFive.reduce((m, p) => (p.rate > m.rate ? p : m), lastFive[0]);
}

export default function BaseRatePage() {
  const { series, latest, stats, updatedAt } = data;
  const change = computeChange(series);
  const recentPeak = findPeak(series);
  const firstRate = series[0];

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "한국은행 기준금리 월별 시계열",
    description:
      "2000년 1월부터 현재까지의 한국은행 기준금리 월별 데이터. 한국은행 ECOS Open API 원천.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "한국은행" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: updatedAt,
    temporalCoverage: `${series[0].date}/${latest.date}`,
    measurementTechnique: "금융통화위원회 결정 기준금리",
    variableMeasured: "한국은행 기준금리 (%)",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "한국은행 기준금리는 어떻게 결정되나요?",
      a: "한국은행 금융통화위원회가 연 8회 회의를 통해 결정합니다. 물가, 성장률, 금융안정 등을 종합 고려해 조정합니다.",
    },
    {
      q: "기준금리가 오르면 어떤 영향이 있나요?",
      a: "대출 금리가 상승해 가계·기업의 이자 부담이 커지고, 예금 금리는 올라 저축 유인이 높아집니다. 일반적으로 자산 가격(부동산·주식)은 하방 압력을 받습니다.",
    },
    {
      q: "현재 기준금리와 예·적금 금리의 차이는 왜 있나요?",
      a: "예·적금 금리는 기준금리에 은행의 조달비용·마진·경쟁 상황이 더해져 결정됩니다. 기준금리는 시장금리의 기준점일 뿐 직접 적용되는 금리가 아닙니다.",
    },
    {
      q: "기준금리 데이터는 얼마나 자주 갱신되나요?",
      a: `이 페이지는 한국은행 ECOS Open API를 통해 월 단위로 수집됩니다. 최근 갱신일: ${updatedAt}.`,
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
      { "@type": "ListItem", position: 4, name: "한국은행 기준금리", item: PAGE_URL },
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
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span>데이터</span>
          <span className="mx-1">/</span>
          <span>금리</span>
          <span className="mx-1">/</span>
          <span className="text-text-primary">한국은행 기준금리</span>
        </nav>

        {/* Block 1: Hero */}
        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            한국은행 기준금리
          </h1>
          <p className="mb-6 text-sm text-text-secondary">
            금융통화위원회가 결정하는 대한민국 기준금리. 모든 시중 대출·예금
            금리의 출발점.
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
                  ? "동결"
                  : `${change > 0 ? "+" : ""}${change.toFixed(2)}%p`}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                직전월 비교
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">역대 최고</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {stats.max.rate}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(stats.max.date)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">역대 최저</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {stats.min.rate}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {formatYM(stats.min.date)}
              </p>
            </div>
          </div>
        </section>

        {/* Block 2: Chart */}
        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            기준금리 추이
          </h2>
          <RateChart series={series} label="기준금리" />
          <p className="mt-3 text-[11px] text-text-secondary">
            출처: 한국은행 ECOS · 갱신: {updatedAt}
          </p>
        </section>

        {/* Ad slot */}
        <div className="mb-8">
          <AdSlot type="inline" />
        </div>

        {/* Block 3: Narrative */}
        <section className="mb-8 space-y-4 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-lg font-semibold text-text-primary">
            지금 기준금리가 의미하는 것
          </h2>
          <p>
            {formatYM(latest.date)} 현재 한국은행 기준금리는{" "}
            <strong className="text-text-primary">{latest.rate}%</strong>
            입니다. 2000년 1월의{" "}
            <strong className="text-text-primary">{firstRate.rate}%</strong>
            와 비교하면 {(latest.rate - firstRate.rate).toFixed(2)}%p{" "}
            {latest.rate > firstRate.rate ? "높고" : "낮고"}, 2000년 이후 평균{" "}
            <strong className="text-text-primary">{stats.average}%</strong>
            보다 {(latest.rate - stats.average).toFixed(2)}%p{" "}
            {latest.rate > stats.average ? "높은" : "낮은"} 수준입니다.
          </p>
          <p>
            최근 5년 내 고점은 {formatYM(recentPeak.date)}의{" "}
            <strong className="text-text-primary">{recentPeak.rate}%</strong>
            였으며, 현재 대비{" "}
            {(recentPeak.rate - latest.rate).toFixed(2)}%p 차이가 납니다. 기준금리는
            대출 이자, 예금 이자, 채권 수익률, 환율, 부동산·주식 등 자산시장에
            직·간접적인 영향을 주기 때문에 개인 재무 계획에서 반드시 체크해야
            하는 숫자입니다.
          </p>
          <p>
            이 페이지는 한국은행 ECOS Open API에서 월 단위로 집계되는 원천
            데이터를 기반으로 합니다. 금통위가 금리를 동결·인상·인하할 때마다
            곧 반영됩니다.
          </p>
        </section>

        {/* Block 4: Table */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 기준금리
          </h2>
          <RateTable series={series} label="기준금리" />
        </section>

        {/* Block 5: FAQ */}
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

        {/* Block 6: Calculator CTA */}
        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            이 데이터로 내 상황을 계산해보세요
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            기준금리가 오르내리면 대출 이자와 투자 복리 결과가 달라집니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/finance/loan-calculator"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              주택대출 시뮬레이터
            </Link>
            <Link
              href="/finance/compound-interest"
              className="rounded-md border border-primary bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
            >
              복리 계산기
            </Link>
            <Link
              href="/finance/deposit-calculator"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              예·적금 계산기
            </Link>
          </div>
        </section>

        {/* Block 7: Sources */}
        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 출처 및 면책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              원천: 한국은행 경제통계시스템 (ECOS) ·{" "}
              <a
                href="https://ecos.bok.or.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ecos.bok.or.kr
              </a>
            </li>
            <li>집계 단위: 월말 기준금리 (금통위 결정 반영)</li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              본 데이터는 참고용입니다. 투자·대출 등 실제 의사결정 시 금융기관·
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
