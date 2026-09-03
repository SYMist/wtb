import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "만 나이 계산기 - 생년월일 나이 계산 | Tooly",
  description:
    "생년월일을 입력하면 만 나이와 한국식 나이, 다음 생일까지 남은 일수, 살아온 일수를 계산합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
