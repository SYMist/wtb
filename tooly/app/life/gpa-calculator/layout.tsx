import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "학점 계산기 - 평균 학점(GPA) 계산 | Tooly",
  description:
    "과목별 학점과 성적을 입력하면 평균 학점을 자동으로 계산합니다. 4.3/4.5 만점 지원.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
