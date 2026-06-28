/**
 * GA4 클라이언트 이벤트 전송 헬퍼.
 * gtag는 app/layout.tsx에서 lazyOnload로 주입됨 — 아직 로드 전이면 조용히 무시.
 */
declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      target: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // gtag 미로딩 — 무시
  }
}
