import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("연봉 실수령액 계산기", "4대보험·소득세 공제 후 월 실수령액 계산", "금융");
}
