import { Suspense } from "react";
import AreaConverterClient from "./AreaConverterClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function AreaConverterPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AreaConverterClient
        initialPyeong={str(params.pyeong) ?? "25"}
        initialSqm={str(params.sqm)}
      />
    </Suspense>
  );
}
