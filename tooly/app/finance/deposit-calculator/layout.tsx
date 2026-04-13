import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예적금 이자 계산기 - 세후 수령액 계산 | Tooly",
  description:
    "예금·적금 이자를 세전/세후로 계산합니다. 일반과세·비과세·세금우대 유형별 만기 수령액을 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
