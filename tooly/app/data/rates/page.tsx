import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import baseData from "@/lib/data/base-rate-series.json";
import mortgageData from "@/lib/data/mortgage-rate-series.json";
import depositData from "@/lib/data/deposit-rate-series.json";

type Point = { date: string; rate: number };
type SeriesData = {
  series: Point[];
  latest: Point;
  stats: { average: number };
  updatedAt: string;
};

const base = baseData as SeriesData;
const mortgage = mortgageData as SeriesData;
const deposit = depositData as SeriesData;

const PAGE_URL = "https://tooly.deluxo.co.kr/data/rates";

export const metadata: Metadata = {
  title: "금리 데이터 모음 — 기준금리, 주담대, 예·적금 금리",
  description: `한국의 핵심 금리 지표 월별 시계열. 기준금리 ${base.latest.rate}%, 주담대 평균 ${mortgage.latest.rate}%, 정기예금 ${deposit.latest.rate}% (최근 기준).`,
  alternates: { canonical: PAGE_URL },
};

interface RateCard {
  title: string;
  href: string;
  value?: string;
  valueDate?: string;
  average?: string;
  description: string;
  status: "live" | "coming";
}

const cards: RateCard[] = [
  {
    title: "한국은행 기준금리",
    href: "/data/rates/base",
    value: `${base.latest.rate}%`,
    valueDate: base.latest.date,
    average: `${base.stats.average}%`,
    description:
      "금통위가 결정하는 대한민국 정책금리. 모든 시중 금리의 기준점.",
    status: "live",
  },
  {
    title: "주택담보대출 평균 금리",
    href: "/data/rates/mortgage",
    value: `${mortgage.latest.rate}%`,
    valueDate: mortgage.latest.date,
    average: `${mortgage.stats.average}%`,
    description:
      "예금은행이 신규 취급한 주담대의 가중평균금리. 기준금리 + 스프레드 구조.",
    status: "live",
  },
  {
    title: "정기예금 평균 금리",
    href: "/data/rates/deposit",
    value: `${deposit.latest.rate}%`,
    valueDate: deposit.latest.date,
    average: `${deposit.stats.average}%`,
    description:
      "예금은행 정기예금 신규취급액 가중평균금리. 시중 예금시장 금리 흐름.",
    status: "live",
  },
  {
    title: "국고채 10년 금리",
    href: "/data/rates/treasury-10y",
    description:
      "장기 시장금리 벤치마크. 물가·경기 기대를 반영. (추후 추가)",
    status: "coming",
  },
];

export default function RatesHubPage() {
  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span>데이터</span>
          <span className="mx-1">/</span>
          <span className="text-text-primary">금리</span>
        </nav>

        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            금리 데이터
          </h1>
          <p className="text-sm text-text-secondary">
            한국의 핵심 금리 지표를 월별 시계열로 제공합니다. 기준금리·대출·
            예금·채권 금리를 한 곳에서 비교하세요. 모든 데이터는 한국은행 ECOS에
            기반합니다.
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
            <li>모든 금리 시계열은 한국은행 경제통계시스템(ECOS)에서 집계</li>
            <li>월 1회 자동 갱신 (매월 1일 12:00 KST, GitHub Actions)</li>
            <li>
              데이터가 실제 변경된 경우에만 업데이트 (금통위 동결 달엔 변화 없음)
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
