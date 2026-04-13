import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "속도 단위 변환기 - km/h m/s mph 변환 | Tooly",
  description:
    "km/h, m/s, mph 속도 단위를 간편하게 상호 변환합니다. 어느 단위로 입력해도 나머지 두 단위로 즉시 변환됩니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
