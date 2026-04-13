import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "근무일수 계산기 - 영업일 계산 (공휴일 제외) | Tooly",
  description:
    "두 날짜 사이의 근무일수를 공휴일과 주말을 제외하여 계산합니다. 2026년 대한민국 법정 공휴일 반영.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
