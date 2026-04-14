import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("주택대출 종합 시뮬레이터", "원리금균등·원금균등·만기일시 상환 방식 비교", "금융");
}
