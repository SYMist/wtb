import { Suspense } from "react";
import SalaryCalculatorClient from "./SalaryCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function parseIntParam(
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

export default async function SalaryCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const initialAnnual = parseIntParam(
    params.annual,
    40_000_000,
    20_000_000,
    200_000_000
  );
  const initialDependents = parseIntParam(params.dependents, 1, 1, 11);
  const initialChildren = parseIntParam(params.children, 0, 0, 7);
  const initialNonTaxable = parseIntParam(params.nonTaxable, 0, 0, 5_000_000);

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SalaryCalculatorClient
        initialAnnual={initialAnnual}
        initialDependents={initialDependents}
        initialChildren={initialChildren}
        initialNonTaxable={initialNonTaxable}
      />
    </Suspense>
  );
}
