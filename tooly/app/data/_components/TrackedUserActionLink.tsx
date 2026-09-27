"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { createCooldownTracker, trackEvent } from "@/lib/analytics";

interface TrackedUserActionLinkProps {
  href: string;
  className: string;
  eventName: string;
  eventParams: Record<string, unknown>;
  children: ReactNode;
}

/** 데이터에서 만든 유효 프리셋의 빠른 중복 클릭만 한 번으로 기록한다. */
export default function TrackedUserActionLink({
  href,
  className,
  eventName,
  eventParams,
  children,
}: TrackedUserActionLinkProps) {
  const sendOnce = useRef(
    createCooldownTracker(() => trackEvent(eventName, eventParams)),
  );

  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        sendOnce.current();
      }}
    >
      {children}
    </Link>
  );
}
