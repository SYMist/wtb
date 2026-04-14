import { Suspense } from "react";
import CompoundInterestClient from "./CompoundInterestClient";

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

export default async function CompoundInterestPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const initialMonthly = parseNumParam(params.monthly, 500_000, 0, 10_000_000);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-text-secondary">로딩 중...</div>
        </div>
      }
    >
      <CompoundInterestClient initialMonthly={initialMonthly} />
    </Suspense>
  );
}
