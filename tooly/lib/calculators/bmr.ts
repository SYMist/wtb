export type Gender = "male" | "female";

export interface BmrResult {
  bmr: number;
  formula: string;
}

/** 미플린-세인트 조어 공식 (Mifflin-St Jeor) */
export function calculateBmr(
  gender: Gender,
  heightCm: number,
  weightKg: number,
  age: number
): BmrResult {
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  return {
    bmr: Math.round(bmr),
    formula: "Mifflin-St Jeor",
  };
}
