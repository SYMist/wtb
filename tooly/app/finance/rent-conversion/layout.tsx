import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전월세 전환 계산기 - 보증금 월세 변환 | Tooly",
  description:
    "전세 보증금과 월세를 법정 전환율 기준으로 상호 변환합니다. 보증금에서 월세, 월세에서 전세 보증금을 즉시 계산하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
