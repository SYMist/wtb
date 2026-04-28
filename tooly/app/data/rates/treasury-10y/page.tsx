import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import treasury10yData from "@/lib/data/treasury10y-rate-series.json";
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

const data = treasury10yData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/rates/treasury-10y";

export const metadata: Metadata = {
  title: "국고채 10년 금리 추이 (월평균)",
  description: `${data.latest.date} 기준 국고채 10년 수익률은 ${data.latest.rate}%. 2000년 이후 월별 시계열과 장단기 스프레드 흐름을 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `국고채 10년 금리 ${data.latest.rate}% (${data.latest.date})`,
    description: "한국은행 ECOS 기반 국고채 10년 수익률 월평균 시계열.",
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

function computeYoY(series: Point[]) {
  if (series.length < 13) return null;
  const current = series[series.length - 1];
  const yearAgo = series[series.length - 13];
  return {
    value: current.rate - yearAgo.rate,
    yearAgo,
  };
}

export default function Treasury10yPage() {
  const { series, latest, stats, updatedAt } = data;
  const change = computeChange(series);
  const yoy = computeYoY(series);

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "국고채 10년 수익률 월평균",
    description:
      "한국은행 ECOS 817Y002 (010210000) — 국고채 10년 수익률 월평균 시계열.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "한국은행" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: updatedAt,
    temporalCoverage: `${series[0].date}/${latest.date}`,
    measurementTechnique: "월평균",
    variableMeasured: "국고채 10년 수익률 (%)",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "국고채 10년 금리가 왜 중요한가요?",
      a: "장기 대출금리·회사채·모기지 금리의 기준이 됩니다. 투자자의 장기 성장·물가 기대를 직접 반영하는 시장금리입니다.",
    },
    {
      q: "데이터 출처는?",
      a: "한국은행 ECOS 통계 817Y002 / 010210000 (국고채 10년), 월평균입니다.",
    },
    {
      q: "기준금리와 국고채 10년의 차이는?",
      a: "기준금리는 한국은행이 결정하는 단기 정책금리입니다. 국고채 10년은 시장에서 결정되는 장기금리입니다. 경기 확장기엔 장기 > 단기(정상 수익률 곡선), 침체 우려 시 역전될 수 있습니다.",
    },
    {
      q: "수익률 역전이 뭔가요?",
      a: "단기금리가 장기금리보다 높아지는 현상입니다. 역사적으로 경기침체의 선행 신호로 주목받습니다.",
    },
    {
      q: "금리가 오르면 채권 가격은 왜 내려가나요?",
      a: "채권 가격과 금리는 역의 관계입니다. 시장금리가 오르면 기존에 발행된 낮은 쿠폰의 채권 가치가 상대적으로 하락합니다.",
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
      { "@type": "ListItem", position: 4, name: "국고채 10년", item: PAGE_URL },
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
          <span className="text-text-primary">국고채 10년</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            국고채 10년 금리
          </h1>
          <p className="mb-6 text-sm text-text-secondary">
            장기 시장금리 벤치마크. 물가·경기 기대와 한은 정책 방향을 반영하는 핵심 채권 지표.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">현재</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {latest.rate.toFixed(2)}%
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
              <p className="text-xs text-text-secondary">1년 전 대비</p>
              <p
                className={`mt-1 text-2xl font-bold ${
                  yoy && yoy.value > 0
                    ? "text-red-600"
                    : yoy && yoy.value < 0
                      ? "text-blue-600"
                      : "text-text-primary"
                }`}
              >
                {yoy
                  ? `${yoy.value > 0 ? "+" : ""}${yoy.value.toFixed(2)}%p`
                  : "-"}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {yoy ? `vs ${formatYM(yoy.yearAgo.date)}` : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">장기 평균</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {stats.average.toFixed(2)}%
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {series[0].date} ~
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            국고채 10년 금리 추이
          </h2>
          <RateChart
            series={series}
            label="국고채 10년"
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
            지금 국고채 10년 금리가 의미하는 것
          </h2>
          <p>
            {formatYM(latest.date)} 국고채 10년 수익률은{" "}
            <strong className="text-text-primary">{latest.rate.toFixed(2)}%</strong>
            입니다.{" "}
            {yoy && (
              <>
                1년 전({formatYM(yoy.yearAgo.date)}, {yoy.yearAgo.rate.toFixed(2)}%)
                대비{" "}
                <strong className="text-text-primary">
                  {yoy.value > 0 ? "+" : ""}
                  {yoy.value.toFixed(2)}%p
                </strong>{" "}
                {yoy.value > 0 ? "상승" : "하락"}했습니다.
              </>
            )}
          </p>
          <p>
            역대 최고는 {formatYM(stats.max.date)}의{" "}
            <strong className="text-text-primary">{stats.max.rate.toFixed(2)}%</strong>,
            최저는 {formatYM(stats.min.date)}의{" "}
            <strong className="text-text-primary">{stats.min.rate.toFixed(2)}%</strong>
            였습니다.
          </p>
          <p>
            국고채 10년은 장기 성장·물가 기대를 반영하는 시장금리입니다. 기준금리보다 높거나 낮은 스프레드(장단기 스프레드)는 경기 사이클 선행 지표로 활용됩니다. 단기금리가 장기금리를 역전하면 역사적으로 경기침체의 전조 신호로 해석되는 경우가 많습니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 국고채 10년 금리
          </h2>
          <RateTable series={series} label="국고채 10년" />
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
            관련 금융 계산기
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            현재 금리 수준을 바탕으로 대출 상환 시뮬레이션이나 다른 금리 지표를 확인해보세요.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/finance/loan-calculator"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              대출 계산기
            </Link>
            <Link
              href="/data/rates/base"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              기준금리 추이
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
              원천: 한국은행 ECOS · 통계 817Y002 / 010210000 (국고채 10년), 월평균
            </li>
            <li>집계 단위: 월평균</li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              이 페이지의 금리 데이터는 참고용입니다. 투자 결정 시 당일 시장 데이터를 반드시 확인하세요.
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
