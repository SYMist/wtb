import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "날짜 계산기 모음 | Tooly",
  description:
    "D-day, 날짜 차이, 요일 계산 등 날짜 관련 계산기를 모아놓았습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
