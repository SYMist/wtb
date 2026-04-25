"use client";

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-5716436301710258";

const SLOT_IDS: Record<AdSlotProps["type"], string> = {
  banner: "1122812925",
  inline: "7075871397",
  sidebar: "6430979927",
};

const sizeStyle: Record<AdSlotProps["type"], string> = {
  banner: "min-h-[90px] sm:min-h-[100px]",
  inline: "min-h-[250px]",
  sidebar: "min-h-[600px]",
};

interface AdSlotProps {
  type: "banner" | "inline" | "sidebar";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({ type, className = "" }: AdSlotProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle may not be loaded yet (lazyOnload). Auto-processed once script loads.
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle block ${sizeStyle[type]} ${
        type === "sidebar" ? "hidden lg:block" : ""
      } ${className}`}
      style={{ display: "block" }}
      data-ad-client={AD_CLIENT}
      data-ad-slot={SLOT_IDS[type]}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
