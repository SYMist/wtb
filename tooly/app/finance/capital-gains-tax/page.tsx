import { Suspense } from "react";
import CapitalGainsTaxClient from "./CapitalGainsTaxClient";

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

export default async function CapitalGainsTaxPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const initialAcquisition = parseIntParam(params.acq, 500_000_000, 0, 100_000_000_000);
  const initialSelling = parseIntParam(params.sell, 800_000_000, 0, 100_000_000_000);
  const initialHoldingYears = parseIntParam(params.years, 5, 0, 30);
  const initialResidenceYears = parseIntParam(params.live, 5, 0, 30);
  const initialExpenses = parseIntParam(params.exp, 0, 0, 100_000_000_000);
  const initialSingleHome = params.single === "true";

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CapitalGainsTaxClient
        initialAcquisition={initialAcquisition}
        initialSelling={initialSelling}
        initialHoldingYears={initialHoldingYears}
        initialResidenceYears={initialResidenceYears}
        initialSingleHome={initialSingleHome}
        initialExpenses={initialExpenses}
      />
    </Suspense>
  );
}
