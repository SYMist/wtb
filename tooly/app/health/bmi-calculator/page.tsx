import { Suspense } from "react";
import BmiCalculatorClient from "./BmiCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function intParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  if (!value) return defaultValue;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

export default async function BmiCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BmiCalculatorClient
        initialHeight={intParam(params.height, 170, 50, 250)}
        initialWeight={intParam(params.weight, 70, 10, 300)}
      />
    </Suspense>
  );
}
