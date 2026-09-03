import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "부가세 계산기 - VAT 포함/별도 변환 | Tooly",
  description:
    "공급가액에서 부가세를 계산하거나, 합계금액에서 부가세를 추출합니다. 부가세율 변경 가능.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
