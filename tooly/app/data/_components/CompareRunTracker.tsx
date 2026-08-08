"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface CompareRunTrackerProps {
  cur: string;
  from: string;
  to: string;
  /** 어디서 온 실행인지 — "form" | "preset" | "default". */
  source: string;
}

/**
 * 비교 실행(compare_run) 계측. 폼 제출·프리셋 클릭 모두 GET 네비게이션이라
 * "파라미터가 붙은 URL이 그려졌다" = "비교를 한 번 돌렸다"로 동치다.
 * 그래서 클릭 핸들러가 아니라 렌더 시점에 한 번만 쏜다(이중 계수 방지).
 */
export default function CompareRunTracker({
  cur,
  from,
  to,
  source,
}: CompareRunTrackerProps) {
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const key = `${cur}|${from}|${to}`;
    if (sent.current === key) return;
    sent.current = key;
    trackEvent("compare_run", {
      page: "exchange_compare",
      cur,
      from,
      to,
      source,
    });
  }, [cur, from, to, source]);

  return null;
}
