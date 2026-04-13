import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "투자 복리 계산기 - 적립식 거치식 비교 | Tooly",
  description:
    "초기 투자금과 월 적립액, 수익률을 입력하면 복리 효과를 시각적으로 보여줍니다. 인플레이션 반영 실질 수익 확인.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
