import { createCalculatorOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export default function Image() {
  return createCalculatorOgImage("건강 계산기", "BMI, 기초대사량, 칼로리 계산기 모음", "건강");
}
