"use client";

import { useRef, type ReactNode } from "react";
import { createCooldownTracker, trackEvent } from "@/lib/analytics";

interface TrackedUserActionFormProps {
  action: string;
  className: string;
  eventName: string;
  eventParams: Record<string, unknown>;
  children: ReactNode;
}

/**
 * GET 결과 렌더와 분리해, 브라우저 제약 검사를 통과한 명시적 폼 제출만 기록한다.
 * 짧은 중복 제출만 한 번으로 묶고, 사용자가 돌아와 같은 값을 다시 제출하면 새
 * 행동으로 보낸다. 새로고침·딥링크·기본 렌더는 핸들러를 통과하지 않는다.
 */
export default function TrackedUserActionForm({
  action,
  className,
  eventName,
  eventParams,
  children,
}: TrackedUserActionFormProps) {
  const sendOnce = useRef(
    createCooldownTracker(() => trackEvent(eventName, eventParams)),
  );

  return (
    <form
      method="GET"
      action={action}
      className={className}
      onSubmit={(event) => {
        // Native invalid input은 submit 이벤트 전에 막히지만, 동적으로 바뀐 제약도
        // 직접 완료로 남지 않도록 한 번 더 확인한다.
        if (!event.currentTarget.checkValidity()) return;
        sendOnce.current();
      }}
    >
      {children}
    </form>
  );
}
