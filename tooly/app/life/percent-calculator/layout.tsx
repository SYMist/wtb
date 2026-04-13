import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "퍼센트 계산기 - 비율 변화율 계산 | Tooly",
  description:
    "퍼센트 값, 비율, 변화율을 간편하게 계산합니다. 'A의 B%', 'A는 B의 몇 %', '변화율' 세 가지 모드를 지원합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
