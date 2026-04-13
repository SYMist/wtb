import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "금융 계산기 모음 | Tooly",
  description:
    "주택대출, 연봉 실수령액, 복리 계산 등 금융 관련 계산기를 모아놓았습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
