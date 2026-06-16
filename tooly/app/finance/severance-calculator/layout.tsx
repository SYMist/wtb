import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "퇴직금 계산기 - 퇴직소득세·세후 실수령액까지 | Tooly",
  description:
    "입사일·퇴사일·월급으로 예상 퇴직금과 퇴직소득세(근속연수공제·환산급여·연분연승)를 계산해 세후 실수령액을 보여줍니다. 근속연수별 세금 차이까지 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
