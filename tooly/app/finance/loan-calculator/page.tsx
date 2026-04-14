import { Suspense } from "react";
import LoanCalculatorClient from "./LoanCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function parseNumParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  if (!value) return defaultValue;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

function parseFloatParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  if (!value) return defaultValue;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

export default async function LoanCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const initialPrice = parseNumParam(params.price, 500_000_000, 0, 3_000_000_000);
  const initialLoan = parseNumParam(params.loan, 350_000_000, 0, 3_000_000_000);
  const initialRate = parseFloatParam(params.rate, 3.5, 0.1, 15);
  const initialTerm = parseNumParam(params.term, 30, 1, 40);
  const initialGrace = parseNumParam(params.grace, 0, 0, 10);
  const initialIncome = parseNumParam(params.income, 0, 0, 10_000_000_000);

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-text-secondary">로딩 중...</div>}>
      <LoanCalculatorClient
        initialPrice={initialPrice}
        initialLoan={initialLoan}
        initialRate={initialRate}
        initialTerm={initialTerm}
        initialGrace={initialGrace}
        initialIncome={initialIncome}
      />
    </Suspense>
  );
}
