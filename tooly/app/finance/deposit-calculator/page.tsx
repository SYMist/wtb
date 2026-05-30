import { Suspense } from "react";
import DepositCalculatorClient from "./DepositCalculatorClient";
import type {
  ProductType,
  InterestMethod,
  TaxType,
} from "@/lib/calculators/deposit";

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

function floatParam(
  value: string | string[] | undefined,
  defaultValue: number,
  min: number,
  max: number
): number {
  const raw = str(value);
  if (!raw) return defaultValue;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) return defaultValue;
  return Math.min(Math.max(parsed, min), max);
}

const PRODUCT_TYPES: ProductType[] = ["deposit", "savings"];
const INTEREST_METHODS: InterestMethod[] = ["simple", "compound"];
const TAX_TYPES: TaxType[] = ["normal", "taxFree", "preferential"];

export default async function DepositCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const typeRaw = str(params.type);
  const methodRaw = str(params.method);
  const taxRaw = str(params.tax);

  const initialType: ProductType = PRODUCT_TYPES.includes(typeRaw as ProductType)
    ? (typeRaw as ProductType)
    : "deposit";
  const initialMethod: InterestMethod = INTEREST_METHODS.includes(
    methodRaw as InterestMethod
  )
    ? (methodRaw as InterestMethod)
    : "simple";
  const initialTax: TaxType = TAX_TYPES.includes(taxRaw as TaxType)
    ? (taxRaw as TaxType)
    : "normal";

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DepositCalculatorClient
        initialAmount={intParam(params.amount, 10_000_000, 0, 100_000_000_000)}
        initialRate={floatParam(params.rate, 3.5, 0, 100)}
        initialMonths={intParam(params.months, 12, 1, 600)}
        initialType={initialType}
        initialMethod={initialMethod}
        initialTax={initialTax}
      />
    </Suspense>
  );
}
