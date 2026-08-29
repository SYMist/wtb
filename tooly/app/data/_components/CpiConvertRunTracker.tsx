"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface CpiConvertRunTrackerProps {
  from: string;
  amount: number;
  /** 어디서 온 실행인지 — "form" | "preset" | "default". */
  source: string;
}

/**
 * 화폐가치 환산 실행(cpi_convert_run) 계측. GET 네비게이션이므로 "파라미터가
 * 붙은 URL이 그려졌다" = "환산을 한 번 돌렸다"로 동치다. 렌더 시점에 한 번만
 * 쏜다(이중 계수 방지) — exchange/compare의 CompareRunTracker와 같은 패턴.
 */
export default function CpiConvertRunTracker({
  from,
  amount,
  source,
}: CpiConvertRunTrackerProps) {
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const key = `${from}|${amount}`;
    if (sent.current === key) return;
    sent.current = key;
    trackEvent("cpi_convert_run", {
      page: "prices_cpi",
      from,
      amount,
      source,
    });
  }, [from, amount, source]);

  return null;
}
