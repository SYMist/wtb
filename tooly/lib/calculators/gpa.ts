export type GpaScale = "4.3" | "4.5";

export interface Course {
  name: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS_43: Record<string, number> = {
  "A+": 4.3, "A0": 4.0, "A-": 3.7,
  "B+": 3.3, "B0": 3.0, "B-": 2.7,
  "C+": 2.3, "C0": 2.0, "C-": 1.7,
  "D+": 1.3, "D0": 1.0, "D-": 0.7,
  "F": 0,
};

const GRADE_POINTS_45: Record<string, number> = {
  "A+": 4.5, "A0": 4.0, "A-": 3.5,
  "B+": 3.5, "B0": 3.0, "B-": 2.5,
  "C+": 2.5, "C0": 2.0, "C-": 1.5,
  "D+": 1.5, "D0": 1.0, "D-": 0.5,
  "F": 0,
};

export function getGradeOptions(scale: GpaScale): string[] {
  return Object.keys(scale === "4.3" ? GRADE_POINTS_43 : GRADE_POINTS_45);
}

export interface GpaResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  maxGpa: number;
}

export function calculateGpa(courses: Course[], scale: GpaScale): GpaResult {
  const gradeMap = scale === "4.3" ? GRADE_POINTS_43 : GRADE_POINTS_45;
  const maxGpa = scale === "4.3" ? 4.3 : 4.5;

  let totalCredits = 0;
  let totalPoints = 0;

  for (const course of courses) {
    if (course.credits > 0 && course.grade in gradeMap) {
      totalCredits += course.credits;
      totalPoints += course.credits * gradeMap[course.grade];
    }
  }

  const gpa = totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;

  return { gpa, totalCredits, totalPoints: Math.round(totalPoints * 100) / 100, maxGpa };
}
