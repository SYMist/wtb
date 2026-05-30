import { Suspense } from "react";
import RentConversionClient from "./RentConversionClient";

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

function floatParam(
  value: string | string[] | undefined,
  min: number,
  max: number
): number | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) return undefined;
  return Math.min(Math.max(parsed, min), max);
}

export default async function RentConversionPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RentConversionClient
        initialDeposit={intParam(params.deposit, 100_000_000, 0, 100_000_000_000)}
        initialRent={intParam(params.rent, 500_000, 0, 1_000_000_000)}
        initialRate={floatParam(params.rate, 0, 100)}
      />
    </Suspense>
  );
}
