import { Suspense } from "react";
import DateDifferenceClient from "./DateDifferenceClient";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function str(value: string | string[] | undefined): string | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

// 서버 타임존과 무관하게 KST(UTC+9) 기준 오늘 날짜를 계산
function kstToday(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export default async function DateDifferencePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const today = kstToday();

  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DateDifferenceClient
        initialStart={str(params.start) ?? today}
        initialEnd={str(params.end) ?? today}
      />
    </Suspense>
  );
}
