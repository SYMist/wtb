import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "환율 계산기 - 실시간 환율 변환 | Tooly",
  description:
    "원화와 주요 외화 간 환율을 실시간으로 변환합니다. 한국수출입은행 환율 기준.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
