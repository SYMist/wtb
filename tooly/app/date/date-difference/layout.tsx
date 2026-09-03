import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "날짜 차이 계산기 - 두 날짜 사이 기간 | Tooly",
  description:
    "두 날짜 사이의 일수, 주, 월, 년 차이를 계산합니다. 윤년을 반영한 정확한 날짜 차이를 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
