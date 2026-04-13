import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "퇴직금 계산기 - 예상 퇴직금 조회 | Tooly",
  description:
    "입사일, 퇴사일, 최근 3개월 월평균 급여를 입력하면 예상 퇴직금을 자동으로 계산합니다. 근속기간과 1일 평균임금도 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
