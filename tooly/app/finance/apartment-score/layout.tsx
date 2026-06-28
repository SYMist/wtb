import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아파트 점수 계산기 — 5가지 기준 가중 점수로 매물 비교 | Tooly",
  description:
    "역세권·강남 접근·전용면적·컨디션·세대수·연식 5가지 기준에 내 가중치를 매겨 아파트 매물에 점수를 내고 후보를 비교합니다. 실제 매수 의사결정 방법론을 그대로 옮긴 점수표.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
