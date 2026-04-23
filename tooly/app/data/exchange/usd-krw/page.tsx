import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import usdkrwData from "@/lib/data/usdkrw-rate-series.json";
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

const data = usdkrwData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/exchange/usd-krw";

const fmtWon = (v: number) =>
  `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;
const fmtWonChange = (v: number) =>
  `${v > 0 ? "+" : ""}${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;

export const metadata: Metadata = {
  title: "원/달러 환율 추이 (월평균 매매기준율)",
  description: `${data.latest.date} 기준 원/미국달러 월평균 환율은 ${fmtWon(data.latest.rate)}. 1980년부터의 월별 시계열과 주요 국면을 확인하세요.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `원/달러 환율 ${fmtWon(data.latest.rate)} (${data.latest.date})`,
    description: "한국은행 ECOS 기반 원/미국달러 월평균 매매기준율 시계열.",
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
    percent: ((current.rate - yearAgo.rate) / yearAgo.rate) * 100,
    yearAgo,
  };
}

export default function UsdKrwPage() {
  const { series, latest, stats, updatedAt } = data;
  const change = computeChange(series);
  const yoy = computeYoY(series);

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "원/미국달러 환율(매매기준율) 월평균",
    description:
      "한국은행 ECOS 731Y004 (원/미국달러 · 평균자료) — 대원화 환율 월평균 시계열.",
    url: PAGE_URL,
    creator: { "@type": "Organization", name: "한국은행" },
    distributor: { "@type": "Organization", name: "Tooly" },
    license: "https://ecos.bok.or.kr",
    dateModified: updatedAt,
    temporalCoverage: `${series[0].date}/${latest.date}`,
    measurementTechnique: "월평균 매매기준율",
    variableMeasured: "원/달러 환율 (KRW per USD)",
    inLanguage: "ko",
  };

  const faq = [
    {
      q: "매매기준율이 뭔가요?",
      a: "은행 간 외환거래의 가중평균 환율로, 서울외국환중개가 집계합니다. 고객이 은행에서 환전할 때의 현찰 환율은 여기에 수수료(스프레드)가 얹혀 있어 더 비쌉니다.",
    },
    {
      q: "이 숫자는 어디서 왔나요?",
      a: "한국은행 ECOS 통계 731Y004 '주요국 통화의 대원화환율' 중 원/미국달러 평균자료 항목입니다. 해당 월 영업일 매매기준율의 단순평균입니다.",
    },
    {
      q: "환율이 오르면(원화 약세) 뭐가 달라지나요?",
      a: "수입 물가 상승(기름·원자재·해외여행 비용↑), 수출 기업 이익 개선, 해외 주식·달러 자산 평가익 증가, 외국인 국내투자 유출 가능성이 높아집니다.",
    },
    {
      q: "환율이 내리면(원화 강세) 어떤 영향이 있나요?",
      a: "수입 물가 하락, 해외여행·유학 부담 감소, 수출 기업 수익성 악화, 외국인 투자 유입 유리 환경이 됩니다.",
    },
    {
      q: "실시간 환율과 왜 다른가요?",
      a: "이 페이지는 월평균이고 실시간 환율은 분 단위로 변합니다. 환전 계획에는 각 은행의 당일 고시 환율을 반드시 확인하세요.",
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
      { "@type": "ListItem", position: 3, name: "환율", item: "https://tooly.deluxo.co.kr/data/exchange" },
      { "@type": "ListItem", position: 4, name: "원/달러", item: PAGE_URL },
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
          <Link href="/data/exchange" className="hover:text-primary">환율</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">원/달러</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            원/달러 환율
          </h1>
          <p className="mb-6 text-sm text-text-secondary">
            한국은행 ECOS 기준 원/미국달러 매매기준율의 월평균 시계열. 1980년
            이후 한국 경제의 거시 흐름을 한눈에 보여주는 핵심 지표.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">현재</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {fmtWon(latest.rate)}
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
                {change === 0 ? "보합" : fmtWonChange(change)}
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
                  ? `${yoy.percent > 0 ? "+" : ""}${yoy.percent.toFixed(1)}%`
                  : "-"}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {yoy ? `vs ${formatYM(yoy.yearAgo.date)}` : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">장기 평균</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {fmtWon(stats.average)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {series[0].date} ~
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            원/달러 환율 추이
          </h2>
          <RateChart
            series={series}
            label="원/달러"
            color="#059669"
            interpolation="monotone"
            format={{
              unit: "원",
              useCommas: true,
              precision: 2,
              tickPrecision: 0,
              hideTickUnit: true,
            }}
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
            지금 환율이 의미하는 것
          </h2>
          <p>
            {formatYM(latest.date)} 원/달러 월평균 환율은{" "}
            <strong className="text-text-primary">{fmtWon(latest.rate)}</strong>
            입니다.{" "}
            {yoy && (
              <>
                1년 전({formatYM(yoy.yearAgo.date)}, {fmtWon(yoy.yearAgo.rate)})
                대비{" "}
                <strong className="text-text-primary">
                  {yoy.percent > 0 ? "+" : ""}
                  {yoy.percent.toFixed(1)}%
                </strong>{" "}
                {yoy.percent > 0 ? "원화가 약세" : "원화가 강세"}로 움직였습니다.
              </>
            )}
          </p>
          <p>
            역대 최고는 {formatYM(stats.max.date)}의{" "}
            <strong className="text-text-primary">
              {fmtWon(stats.max.rate)}
            </strong>
            (IMF 외환위기 직후), 최저는 {formatYM(stats.min.date)}의{" "}
            <strong className="text-text-primary">
              {fmtWon(stats.min.rate)}
            </strong>
            입니다. 1997년 외환위기, 2008년 글로벌 금융위기, 2022년 미 연준
            긴축처럼 대외 충격이 원화 가치에 직격으로 반영된 시점을 차트에서
            확인할 수 있습니다.
          </p>
          <p>
            환율은 한·미 금리차, 경상수지, 외국인 자본 이동, 지정학적 리스크 등
            여러 변수가 동시에 작용합니다. 월평균은 단기 노이즈를 걸러주지만,
            실제 환전·투자 시에는 당일 실시간 환율과 수수료를 함께 고려해야
            합니다.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            월별 원/달러 환율
          </h2>
          <RateTable
            series={series}
            label="원/달러"
            format={{
              unit: "원",
              changeUnit: "원",
              useCommas: true,
              precision: 2,
            }}
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

        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">
            실제 환전 금액을 계산해보세요
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            주요 통화 간 실시간 환율 기반으로 원화·외화 환전액을 변환할 수
            있습니다.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/convert/currency-converter"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              환율 변환기
            </Link>
            <Link
              href="/data/rates/base"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              기준금리 추이
            </Link>
            <Link
              href="/data/exchange"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              전체 환율 데이터
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 출처 및 면책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              원천: 한국은행 ECOS · 통계 731Y004 (주요국 통화의 대원화환율) ·
              항목 0000001 (원/미국달러) × 0000100 (평균자료)
            </li>
            <li>집계 단위: 월평균 매매기준율</li>
            <li>최근 갱신일: {updatedAt}</li>
            <li>
              실제 환전 시 적용 환율은 은행별 스프레드·수수료에 따라 다릅니다.
              환전 계획 시 당일 실시간 고시 환율을 반드시 확인하세요.
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
