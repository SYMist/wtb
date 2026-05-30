import { Suspense } from "react";
import VatCalculatorClient from "./VatCalculatorClient";

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

export default async function VatCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mode = params.mode === "total" ? "total" : "supply";

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VatCalculatorClient
        initialMode={mode}
        initialAmount={intParam(params.amount, 1_000_000, 0, 100_000_000_000)}
        initialRate={intParam(params.rate, 10, 0, 100)}
      />
    </Suspense>
  );
}
