import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/common/Footer";
import GNB from "@/components/common/GNB";
import boardData from "@/lib/data/us-treasury-interpretation.json";
import type { UsTreasuryInterpretationData } from "@/lib/data/us-treasury-interpretation";
import UsTreasuryInterpretation from "./UsTreasuryInterpretation";

const PAGE_URL = "https://tooly.deluxo.co.kr/data/us-treasury-10y";
const data = boardData as UsTreasuryInterpretationData;
const latest = data.treasury10y.at(-1)!;

export const metadata: Metadata = {
  title: "미국채 10년 금리 해석 — A/B 두 시점 비교",
  description: `${latest.date} 기준 미국 10년 만기 국채 수익률은 ${latest.value}%. 두 실제 관측일의 bp 변화와 같은 기간 원/달러 관측값을 함께 확인합니다.`,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `미국채 10년 금리 ${latest.value}% (${latest.date})`,
    description: "Federal Reserve Board H.15/H.10 기반 일별 A/B 비교.",
    url: PAGE_URL,
    type: "article",
  },
};

export default function UsTreasury10yPage() {
  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <Link href="/data" className="hover:text-primary">데이터</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">미국채 10년</span>
        </nav>
        <section className="mb-8">
          <p className="text-xs font-medium text-primary">미국 일별 시계열 · 한국 국고채와 별도</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">미국채 10년 금리 해석</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
            두 실제 관측일의 미국 10년물 수익률과 같은 기간 원/달러 관측값을 나란히 읽습니다.
            관측된 숫자와 가능한 영향 경로를 구분하며, 한국 금리·물가·주가의 원인을 단정하지 않습니다.
          </p>
        </section>
        <UsTreasuryInterpretation data={data} />
        <section className="mt-8 rounded-lg border border-border bg-background p-4 text-xs leading-relaxed text-text-secondary sm:p-6">
          <h2 className="font-semibold text-text-primary">원천과 범위</h2>
          <p className="mt-2">
            미국 10년물은 Federal Reserve Board H.15의 nominal 10-year Treasury constant maturity,
            원/달러는 H.10의 South Korean won per U.S. dollar 일별 관측값입니다. H.15는 평일 4:15 p.m.에,
            H.10은 월요일 4:15 p.m.에 전 영업주 관측값을 발표합니다.
          </p>
          <p className="mt-2">
            관련 시계열 링크: <a className="text-primary underline" href="https://fred.stlouisfed.org/series/DGS10" target="_blank" rel="noreferrer">DGS10</a>{" "}
            · <a className="text-primary underline" href="https://fred.stlouisfed.org/series/DEXKOUS" target="_blank" rel="noreferrer">DEXKOUS</a>
          </p>
          <p className="mt-2">
            <a className="text-primary underline" href="https://www.federalreserve.gov/releases/h15/" target="_blank" rel="noreferrer">H.15 원본</a>{" "}
            · <a className="text-primary underline" href="https://www.federalreserve.gov/releases/h10/" target="_blank" rel="noreferrer">H.10 원본</a>{" "}
            · <a className="text-primary underline" href="https://www.federalreserve.gov/disclaimer.htm" target="_blank" rel="noreferrer">Board 재사용·출처 안내</a>
          </p>
          <p className="mt-2">미국 모기지, TIPS 분해, 한국 대출·물가·주가 계산은 포함하지 않습니다.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
