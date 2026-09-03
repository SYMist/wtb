"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface CancelRunTrackerProps {
  joinDate: string;
  cancelDate: string;
  monthlyAmount: number;
  productType: string;
  source: string;
}

/** compare_run과 동일 패턴 — GET 네비게이션 렌더 시점에 1회만 쏜다(이중 계수 방지). */
export default function CancelRunTracker({
  joinDate,
  cancelDate,
  monthlyAmount,
  productType,
  source,
}: CancelRunTrackerProps) {
  const sent = useRef<string | null>(null);

  useEffect(() => {
    const key = `${joinDate}|${cancelDate}|${monthlyAmount}|${productType}`;
    if (sent.current === key) return;
    sent.current = key;
    trackEvent("subscription_cancel_run", {
      page: "housing_subscription_cancel",
      joinDate,
      cancelDate,
      monthlyAmount,
      productType,
      source,
    });
  }, [joinDate, cancelDate, monthlyAmount, productType, source]);

  return null;
}
