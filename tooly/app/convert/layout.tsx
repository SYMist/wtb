import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "단위 변환기 모음 | Tooly",
  description:
    "평수, 환율 등 단위 변환 계산기를 모아놓았습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
