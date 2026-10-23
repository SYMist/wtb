import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "선납이연 계산기 - 6-1-5·1-11 납입 일정과 예산 비교 | Tooly",
  description: "12개월 적금의 정기 납입·6-1-5·1-11을 비교하고, 날짜별 가용 현금·유입 자금으로 가능한 월 납입액과 대기자금 이자, 수정 일정 CSV·캘린더 파일을 계산합니다.",
  alternates: { canonical: "https://tooly.deluxo.co.kr/finance/prepayment-deferral" },
  openGraph: {
    title: "선납이연 계산기 - 일정·예산·이자 비교 | Tooly",
    description: "6-1-5·1-11 방식별 실제 납입일과 내 자금으로 가능한 금액을 확인하세요.",
    url: "https://tooly.deluxo.co.kr/finance/prepayment-deferral",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
