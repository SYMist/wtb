/**
 * GA4 클라이언트 이벤트 전송 헬퍼.
 * app/layout.tsx의 <head> shim이 window.gtag를 항상 정의해 두므로, gtag.js 로드 전
 * 호출도 dataLayer에 큐잉된다(로드 후 재생). 옵셔널 체이닝은 shim 이전 SSR·예외 상황용 방어.
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
