import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "연봉 실수령액 계산기 - 2026년 4대보험 소득세 계산 | Tooly",
  description:
    "연봉을 입력하면 국민연금, 건강보험, 고용보험, 소득세를 자동 계산하여 월 실수령액을 알려드립니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
