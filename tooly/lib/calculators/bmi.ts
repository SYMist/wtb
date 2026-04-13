export interface BmiResult {
  bmi: number;
  category: string;
  color: string;
  idealWeightMin: number;
  idealWeightMax: number;
}

const BMI_CATEGORIES = [
  { max: 18.5, label: "저체중", color: "#3B82F6" },
  { max: 23, label: "정상", color: "#16A34A" },
  { max: 25, label: "과체중", color: "#EAB308" },
  { max: 30, label: "비만", color: "#F97316" },
  { max: Infinity, label: "고도비만", color: "#DC2626" },
];

export function calculateBmi(heightCm: number, weightKg: number): BmiResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;

  const cat = BMI_CATEGORIES.find((c) => rounded < c.max) ?? BMI_CATEGORIES[4];

  return {
    bmi: rounded,
    category: cat.label,
    color: cat.color,
    idealWeightMin: Math.round(18.5 * heightM * heightM * 10) / 10,
    idealWeightMax: Math.round(23 * heightM * heightM * 10) / 10,
  };
}

export { BMI_CATEGORIES };
