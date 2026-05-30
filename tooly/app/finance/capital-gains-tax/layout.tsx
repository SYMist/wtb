import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "양도소득세 계산기 - 1세대1주택·고가주택 안분까지 | Tooly",
  description:
    "취득가·양도가·보유·거주기간으로 양도소득세를 계산합니다. 1세대 1주택 비과세, 12억 초과 고가주택 안분과세, 장기보유 특별공제 표1·표2를 정확히 반영한 양도세 계산기.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
