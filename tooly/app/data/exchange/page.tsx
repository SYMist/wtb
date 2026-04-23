import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import usdkrwData from "@/lib/data/usdkrw-rate-series.json";

type Point = { date: string; rate: number };
type SeriesData = {
  series: Point[];
  latest: Point;
  stats: { average: number };
  updatedAt: string;
};

const usdkrw = usdkrwData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/exchange";

const fmtWon = (v: number) =>
  `${v.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`;

export const metadata: Metadata = {
  title: "환율 데이터 모음 — 원/달러, 원/엔, 원/위안, 원/유로",
  description: `한국의 주요 환율 월별 시계열. 원/달러 ${fmtWon(usdkrw.latest.rate)} (최근 기준). 한국은행 ECOS 기반.`,
  alternates: { canonical: PAGE_URL },
};

interface ExchangeCard {
  title: string;
  href: string;
  value?: string;
  valueDate?: string;
  average?: string;
  description: string;
  status: "live" | "coming";
}

const cards: ExchangeCard[] = [
  {
    title: "원/미국달러",
    href: "/data/exchange/usd-krw",
    value: fmtWon(usdkrw.latest.rate),
    valueDate: usdkrw.latest.date,
    average: fmtWon(usdkrw.stats.average),
    description:
      "매매기준율 월평균. 한국 외환시장의 중심축이자 거시경제 체온계.",
    status: "live",
  },
  {
    title: "원/일본엔(100엔)",
    href: "/data/exchange/jpy-krw",
    description:
      "엔·달러 크로스와 한·일 금리차 영향. 관광·수출 민감 통화. (추후 추가)",
    status: "coming",
  },
  {
    title: "원/중국위안",
    href: "/data/exchange/cny-krw",
    description:
      "최대 교역국 통화. 위안 고시 환율 변동이 한국 수출에 직접 전달. (추후 추가)",
    status: "coming",
  },
  {
    title: "원/유로",
    href: "/data/exchange/eur-krw",
    description:
      "유로존 정책금리·경기 흐름이 반영되는 주요 통화. (추후 추가)",
    status: "coming",
  },
];

export default function ExchangeHubPage() {
  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span>데이터</span>
          <span className="mx-1">/</span>
          <span className="text-text-primary">환율</span>
        </nav>

        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            환율 데이터
          </h1>
          <p className="text-sm text-text-secondary">
            한국의 주요 통화 환율을 월별 시계열로 제공합니다. 원/달러를 중심으로
            주요 교역국 통화를 한 곳에서 비교하세요. 모든 데이터는 한국은행
            ECOS의 매매기준율 월평균입니다.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => {
            if (card.status === "coming") {
              return (
                <div
                  key={card.title}
                  className="rounded-lg border border-border bg-surface p-5 opacity-70"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-text-primary">
                      {card.title}
                    </h2>
                    <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-text-secondary">
                      준비 중
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {card.description}
                  </p>
                </div>
              );
            }
            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
              >
                <div className="mb-3 flex items-start justify-between">
                  <h2 className="text-base font-semibold text-text-primary">
                    {card.title}
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    LIVE
                  </span>
                </div>
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {card.value}
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    {card.valueDate}
                  </span>
                </div>
                <p className="mb-3 text-sm text-text-secondary">
                  {card.description}
                </p>
                <p className="text-[11px] text-text-secondary">
                  장기 평균: {card.average}
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-10 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 정책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              모든 환율 시계열은 한국은행 ECOS의 매매기준율 월평균에서 집계
            </li>
            <li>월 1회 자동 갱신 (매월 1일 12:00 KST, GitHub Actions)</li>
            <li>
              실시간 환전 환율은 당일 은행 고시 환율을 참고 — 월평균은 추세
              파악용
            </li>
            <li>
              상세 갱신 주기·원천은 각 페이지의 "데이터 출처" 섹션 참고
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
