import { Suspense } from "react";
import CurrencyConverterClient from "./CurrencyConverterClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function CurrencyConverterPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CurrencyConverterClient
        initialFrom={str(params.from) ?? "KRW"}
        initialTo={str(params.to) ?? "USD"}
        initialAmount={str(params.amount) ?? "10000"}
      />
    </Suspense>
  );
}
