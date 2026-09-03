import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기초대사량 계산기 - BMR 자동 계산 | Tooly",
  description:
    "성별, 키, 체중, 나이를 입력하면 하루 기초대사량(BMR)을 Mifflin-St Jeor 공식으로 자동 계산합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
