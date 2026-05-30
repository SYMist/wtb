import { Suspense } from "react";
import SeveranceCalculatorClient from "./SeveranceCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function strParam(
  value: string | string[] | undefined,
  defaultValue: string
): string {
  if (!value) return defaultValue;
  return Array.isArray(value) ? value[0] : value;
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

export default async function SeveranceCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SeveranceCalculatorClient
        initialStart={strParam(params.start, "2020-01-01")}
        initialEnd={strParam(params.end, "2026-04-13")}
        initialPay={intParam(params.pay, 3_000_000, 0, 1_000_000_000)}
      />
    </Suspense>
  );
}
