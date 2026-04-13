import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "D-Day 계산기 - 남은 일수 계산 | Tooly",
  description:
    "목표 날짜까지 남은 일수를 계산합니다. 시험, 기념일, 출산 예정일 등 중요한 날을 D-Day로 관리하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
