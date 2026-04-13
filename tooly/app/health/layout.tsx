import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "건강 계산기 모음 | Tooly",
  description:
    "BMI, 칼로리 등 건강 관련 계산기를 모아놓았습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
