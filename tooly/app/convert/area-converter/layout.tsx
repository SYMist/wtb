import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "평수 계산기 - 평 제곱미터(m²) 변환 | Tooly",
  description:
    "평수를 제곱미터로, 제곱미터를 평수로 간편하게 변환합니다. 1평 = 3.305785m² 기준.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
