import { Suspense } from "react";
import DdayCalculatorClient from "./DdayCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

export default async function DdayCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DdayCalculatorClient
        initialDate={str(params.date)}
        initialName={str(params.name)}
      />
    </Suspense>
  );
}
