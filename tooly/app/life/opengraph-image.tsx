import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("생활 계산기", "학점, 전기요금, 퍼센트 계산기 모음", "생활");
}
