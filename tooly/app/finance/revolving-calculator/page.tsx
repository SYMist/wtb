import { Suspense } from "react";
import RevolvingCalculatorClient from "./RevolvingCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function numberParam(
  value: string | string[] | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export default async function RevolvingCalculatorPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RevolvingCalculatorClient
        initialRolloverPrincipal={numberParam(params.balance, 2_000_000, 0, 1_000_000_000_000)}
        initialAnnualFeeRatePercent={numberParam(params.rate, 17, 0, 100)}
        initialPaymentRatePercent={numberParam(params.payment, 30, 1, 100)}
        initialMonthlyNewPurchases={numberParam(params.monthly, 300_000, 0, 1_000_000_000_000)}
        initialMonths={numberParam(params.months, 36, 1, 60)}
      />
    </Suspense>
  );
}
