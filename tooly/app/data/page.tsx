import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";

const BASE_URL = "https://tooly.deluxo.co.kr";
const PATH = "/data";
const PAGE_URL = `${BASE_URL}${PATH}`;

export const metadata: Metadata = {
  title: "한국 금융 데이터 — 금리·환율·물가 시계열",
  description:
    "기준금리, 예금·주담대 금리, 원/달러 환율, 소비자물가 상승률까지 한국은행 ECOS 기반 시계열 데이터를 한곳에서 확인하세요.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "한국 금융 데이터 — 금리·환율·물가 시계열",
    description: "기준금리·환율·물가 등 한국 금융 데이터 시계열 모음.",
    url: PAGE_URL,
    type: "website",
  },
};

interface DataCard {
  title: string;
  description: string;
  href: string;
  status: "live" | "coming";
}

const cards: DataCard[] = [
  {
    title: "금리",
    description: "기준금리·예금금리·주택담보대출 금리 추이와 스프레드 분석.",
    href: "/data/rates",
    status: "live",
  },
  {
    title: "환율",
    description: "원/달러·원/엔·원/위안·원/유로 환율 시계열과 시점 비교.",
    href: "/data/exchange",
    status: "live",
  },
  {
    title: "물가",
    description: "소비자물가지수(CPI) 전년동월비 추이와 화폐가치 환산.",
    href: "/data/prices/cpi",
    status: "live",
  },
  {
    title: "시장",
    description: "코스피 등 주요 시장 지표 시계열. 준비 중입니다.",
    href: "#",
    status: "coming",
  },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
    { "@type": "ListItem", position: 2, name: "데이터", item: PAGE_URL },
  ],
};

export default function DataHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">데이터</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            한국 금융 데이터
          </h1>
          <p className="text-sm text-text-secondary">
            기준금리, 예금·주담대 금리, 원/달러 환율, 소비자물가 상승률까지 —
            한국은행 ECOS 기반 시계열을 매달 갱신해 정리합니다. 원자료를
            찾아 계산하는 대신, 이미 정리된 표와 그래프에서 바로 확인하세요.
          </p>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          {cards.map((card) =>
            card.status === "live" ? (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
              >
                <h2 className="mb-1 text-base font-semibold text-text-primary">
                  {card.title}
                </h2>
                <p className="text-sm text-text-secondary">{card.description}</p>
              </Link>
            ) : (
              <div
                key={card.title}
                className="rounded-lg border border-dashed border-border bg-surface p-5 opacity-70"
              >
                <div className="mb-1 flex items-center gap-2">
                  <h2 className="text-base font-semibold text-text-primary">
                    {card.title}
                  </h2>
                  <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-text-secondary">
                    준비 중
                  </span>
                </div>
                <p className="text-sm text-text-secondary">{card.description}</p>
              </div>
            ),
          )}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">
            데이터 정책
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>원 출처: 한국은행 경제통계시스템(ECOS), 국가데이터처 승인통계 등 공공 통계.</li>
            <li>월 1회(매월 1일) 자동 갱신되며, 각 페이지에 데이터 최종 변경일을 표시합니다.</li>
            <li>참고용 데이터입니다. 실제 의사결정 시 공식 출처를 함께 확인하세요.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
