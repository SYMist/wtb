"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

interface TrackedCtaLinkProps {
  href: string;
  className: string;
  eventName: string;
  eventParams?: Record<string, unknown>;
  children: ReactNode;
}

export default function TrackedCtaLink({
  href,
  className,
  eventName,
  eventParams,
  children,
}: TrackedCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </Link>
  );
}
