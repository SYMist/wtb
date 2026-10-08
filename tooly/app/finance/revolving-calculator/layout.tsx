import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "리볼빙 이자 계산기 - 기간별 누적 수수료와 남은 원금 | Tooly",
  description:
    "이미 이월된 카드 원금, 내 약정 연 수수료율, 결제비율, 매월 새로 쓰는 일시불 금액으로 1·3·5년 누적 수수료와 남은 원금을 월별로 추정합니다.",
  alternates: {
    canonical: "https://tooly.deluxo.co.kr/finance/revolving-calculator",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
