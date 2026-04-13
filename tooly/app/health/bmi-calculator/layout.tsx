import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI 계산기 - 체질량지수 비만도 측정 | Tooly",
  description:
    "키와 체중을 입력하면 BMI(체질량지수)를 계산하고 비만도를 판정합니다. 정상 체중 범위와 BMI 범위 게이지를 함께 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
