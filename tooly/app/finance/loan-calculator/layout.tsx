import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "주택대출 이자 계산기 - 원리금균등 원금균등 비교 | Tooly",
  description:
    "매매가, 금리, 기간을 입력하면 원리금균등·원금균등·만기일시 상환 방식을 한눈에 비교합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
