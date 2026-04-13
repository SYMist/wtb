import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전기요금 계산기 - 누진세 자동 계산 | Tooly",
  description:
    "월 사용량을 입력하면 한전 누진세를 적용한 전기요금을 계산합니다. 기본요금, 전력량요금, 부가세, 전력산업기반기금을 상세하게 보여줍니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
