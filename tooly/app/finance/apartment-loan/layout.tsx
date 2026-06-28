import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아파트 대출 감당 시뮬레이터 — LTV·DSR로 가능/불가 판정 | Tooly",
  description:
    "집값·목돈·소득·금리·기간을 넣으면 월 원리금과 LTV·DSR을 계산해 대출 감당 가능 여부를 판정합니다. 2026 규제(생애최초 LTV 70%·DSR 40%·스트레스 DSR) 반영. 입력값은 기기 밖으로 전송되지 않습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
