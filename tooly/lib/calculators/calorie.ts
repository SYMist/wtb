export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const activityLevels: { value: ActivityLevel; label: string; factor: number }[] = [
  { value: "sedentary", label: "비활동적 (사무직, 운동 안 함)", factor: 1.2 },
  { value: "light", label: "가벼운 활동 (주 1~3회 운동)", factor: 1.375 },
  { value: "moderate", label: "보통 활동 (주 3~5회 운동)", factor: 1.55 },
  { value: "active", label: "활동적 (주 6~7회 운동)", factor: 1.725 },
  { value: "very_active", label: "매우 활동적 (운동선수급)", factor: 1.9 },
];

export interface CalorieResult {
  maintenance: number; // 유지 칼로리
  loss: number; // 감량 (-500kcal)
  gain: number; // 증량 (+500kcal)
}

export function calculateCalorie(
  bmr: number,
  activityLevel: ActivityLevel
): CalorieResult {
  const factor = activityLevels.find((a) => a.value === activityLevel)?.factor ?? 1.2;
  const maintenance = Math.round(bmr * factor);

  return {
    maintenance,
    loss: Math.max(maintenance - 500, 1200),
    gain: maintenance + 500,
  };
}
