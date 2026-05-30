import { Suspense } from "react";
import AgeCalculatorClient from "./AgeCalculatorClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgeCalculatorPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AgeCalculatorClient initialBirth={str(params.birth)} />
    </Suspense>
  );
}
