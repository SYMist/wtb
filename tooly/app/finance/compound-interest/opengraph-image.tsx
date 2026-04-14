import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("투자 복리 계산기", "적립식·거치식 비교, 인플레이션 반영", "금융");
}
