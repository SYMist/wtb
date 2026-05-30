import { Suspense } from "react";
import BmrCalculatorClient from "./BmrCalculatorClient";
import type { Gender } from "@/lib/calculators/bmr";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function intParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  const raw = str(value);
  if (!raw) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

export default async function BmrCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialGender: Gender = str(params.gender) === "female" ? "female" : "male";

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BmrCalculatorClient
        initialGender={initialGender}
        initialHeight={intParam(params.height, 170, 50, 250)}
        initialWeight={intParam(params.weight, 70, 10, 300)}
        initialAge={intParam(params.age, 30, 1, 120)}
      />
    </Suspense>
  );
}
