import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("금융 계산기", "대출, 연봉, 투자, 세금 계산기 모음", "금융");
}
