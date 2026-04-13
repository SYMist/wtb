import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "생활 계산기 모음 | Tooly",
  description:
    "생활에 유용한 다양한 계산기를 모아놓았습니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
