import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "양도소득세 계산기 - 부동산 양도세 자동 계산 | Tooly",
  description:
    "취득가액, 양도가액, 보유기간을 입력하면 장기보유 특별공제를 반영한 양도소득세를 자동 계산합니다. 1세대 1주택 비과세 여부도 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
