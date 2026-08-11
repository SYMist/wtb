"use client";

import Link from "next/link";

import { trackEvent } from "@/lib/analytics";

interface CalculatorCTAButtonProps {
  href: string;
  /** 이 CTA를 렌더한 글의 slug — GA4 page 파라미터로 들어간다 */
  page: string;
  children: React.ReactNode;
}

/**
 * CalculatorCTA의 버튼만 떼어낸 클라이언트 래퍼.
 * CalculatorCTA 자체를 "use client"로 만들면 이걸 쓰는 12개 글이 통째로
 * 클라이언트 렌더가 되므로(SSR/색인 회귀) 버튼만 분리한다.
 *
 * 이벤트는 기존 스키마 cta_click에 합류 — page × position 한 축으로 읽힌다.
 * (기존 position: base/mortgage/exchange_compare × inline/bottom)
 */
export default function CalculatorCTAButton({
  href,
  page,
  children,
}: CalculatorCTAButtonProps) {
  return (
    <Link
      href={href}
      className="rounded-full bg-indigo-600 px-8 py-3 font-bold text-white transition-all hover:bg-indigo-500"
      onClick={() => trackEvent("cta_click", { page, position: "blog_cta" })}
    >
      {children}
    </Link>
  );
}
