import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "칼로리 계산기 - 일일 권장 칼로리 계산 | Tooly",
  description:
    "기초대사량과 활동 수준에 따라 하루 권장 칼로리를 계산합니다. 감량·유지·증량 목표별 칼로리를 한눈에 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
