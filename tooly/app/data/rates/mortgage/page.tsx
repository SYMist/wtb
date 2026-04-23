import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import mortgageData from "@/lib/data/mortgage-rate-series.json";
import baseData from "@/lib/data/base-rate-series.json";
import RateChart from "../_components/RateChart";
import RateTable from "../_components/RateTable";

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

const data = mortgageData as SeriesData;
const base = baseData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/rates/mortgage";

export const metadata: Metadata = {
  title: "주택담보대출 평균 금리 추이 (신규취급액 기준)",
  description: `${data.latest.date} 기준 예금은행 주택담보대출 신규취급액 가중평균금리는 ${data.latest.rate}%. 2001년 이후 월별 추이와 기준금리 스프레드를 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `주담대 평균 금리 ${data.latest.rate}% (${data.latest.date})`,
    description: "예금은행 주택담보대출 신규취급액 가중평균금리 시계열.",
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

export default function MortgageRatePage() {
  const { series, latest, stats, updatedAt } = data;
  const change = computeChange(series);
  const baseAtLatest = findMatchingBase(latest.date);
  const spread = baseAtLatest !== null ? latest.rate - baseAtLatest : null;

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "예금은행 주택담보대출 신규취급액 가중평균금리",
    description:
      "한국은행 ECOS 121Y006 (BECBLA0302) — 예금은행 주택담보대출 신규취급액 가중평균금리 월별 시계열.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "한국은행" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: updatedAt,
    temporalCoverage: `${series[0].date}/${latest.date}`,
    measurementTechnique: "신규취급액 가중평균",
    variableMeasured: "주택담보대출 금리 (%)",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "주담대 금리는 어떻게 결정되나요?",
      a: "은행 조달금리(기준금리 + 은행채 스프레드)에 각 은행의 마진·리스크 프리미엄이 더해져 결정됩니다. 기준금리 변화가 직접 반영되지만 시차와 은행별 편차가 있습니다.",
    },
    {
      q: "이 숫자는 어디서 왔나요?",
      a: "한국은행 ECOS의 '예금은행 대출금리(신규취급액 기준)' 통계의 주택담보대출 항목입니다. 모든 예금은행이 해당 월에 새로 취급한 주담대의 가중평균입니다.",
    },
    {
      q: "내가 받을 수 있는 실제 금리와 왜 다른가요?",
      a: "이 수치는 전국 평균치입니다. 실제 적용 금리는 신용등급, LTV·DTI, 상품(고정/변동/혼합), 은행, 우대금리 여부에 따라 평균 대비 ±1%p 이상 편차가 있을 수 있습니다.",
    },
    {
      q: "기준금리와의 스프레드는 왜 중요한가요?",
      a: "스프레드가 벌어지면 은행이 위험 프리미엄을 더 붙인 것이고, 좁아지면 경쟁 심화 또는 조달비용 개선을 의미합니다. 대출 타이밍 판단에 참고가 됩니다.",
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
      { "@type": "ListItem", position: 4, name: "주택담보대출 금리", item: PAGE_URL },
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
          <span className="text-text-primary">주택담보대출 금리</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            주택담보대출 평균 금리
          </h1>
          <p className="mb-6 text-sm text-text-secondary">
            예금은행이 해당 월에 신규 취급한 주택담보대출의 가중평균금리. 한국
            주담대 시장 전반의 금리 추세를 나타내는 핵심 지표.
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
                {spread !== null ? `+${spread.toFixed(2)}%p` : "-"}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                주담대 − 기준금리
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">25년 평균</p>
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
            주담대 금리 추이
          </h2>
          <RateChart
            series={series}
            label="주담대 금리"
            color="#dc2626"
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
            지금 주담대 금리가 의미하는 것
          </h2>
          <p>
            {formatYM(latest.date)} 주담대 평균 금리는{" "}
            <strong className="text-text-primary">{latest.rate}%</strong>
            입니다.{" "}
            {spread !== null ? (
              <>
                같은 기간 한국은행 기준금리({baseAtLatest}%) 대비 스프레드는{" "}
                <strong className="text-text-primary">
                  +{spread.toFixed(2)}%p
                </strong>
                . 은행의 조달비용, 신용 리스크 프리미엄, 마진이 합쳐진 격차입니다.
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
            였습니다. 실제 대출 신청 시 적용되는 금리는 신용등급, LTV, 상품
            유형(고정/변동), 은행별 우대금리에 따라 평균에서 크게 벗어날 수
            있습니다.
          </p>
          <p>
            주담대 금리는 기준금리에 직접 연동되지 않고 은행채 금리, 코픽스, 은행
            조달비용을 통해 간접적으로 전달됩니다. 따라서 기준금리 변동 → 주담대
            반영까지 수 주 ~ 수 개월의 시차가 존재합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 주담대 금리
          </h2>
          <RateTable series={series} label="주담대 금리" />
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
            이 금리로 내 대출 이자를 계산해보세요
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            현재 평균 {latest.rate}%를 기준으로 원리금, 이자 총액, 상환 방식별
            차이를 계산할 수 있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/finance/loan-calculator?rate=${latest.rate}`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              주택대출 시뮬레이터
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
              원천: 한국은행 ECOS · 통계 121Y006 (예금은행 대출금리, 신규취급액
              기준) · 항목 BECBLA0302 (주택담보대출)
            </li>
            <li>집계 단위: 월별 가중평균</li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              실제 적용 금리는 신용등급, 상품, 은행별 우대에 따라 편차가 큽니다.
              대출 계획 시 각 은행 공시 금리를 반드시 확인하세요.
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
