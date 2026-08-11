import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-3FEVQE9CED";

export const metadata: Metadata = {
  title: {
    default: "Tooly - 생활 계산기 & 도구 모음",
    template: "%s | Tooly",
  },
  description:
    "주택대출, 연봉 실수령액, 복리 계산 등 생활에 필요한 계산기를 한곳에서. 정확한 공식과 최신 데이터로 빠르게 계산하세요.",
  metadataBase: new URL("https://tooly.deluxo.co.kr"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Tooly",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    other: {
      "naver-site-verification": "cf94922c2e6329caf48068592bf482e4500009c6",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* gtag shim — window.gtag를 항상 존재하게 만들어 trackEvent의 무음 드롭 창을 0으로.
            gtag.js 로드 전 이벤트는 dataLayer에 큐잉됐다가 로드 후 재생된다.
            next/script beforeInteractive는 app router에서 인라인 내용을 self.__next_s 큐로 감싸
            Next 런타임이 실행 → <head> 동기 실행이 아니라 여기선 쓰지 않는다(2026-08-11). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}`,
          }}
        />
        {/* Pretendard Webfont */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5716436301710258"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}

        {/* Google Analytics 4 — afterInteractive: lazyOnload는 "모든 리소스 fetch 완료 후" 로드라
            AdSense/DoubleClick 호출이 많은 페이지에서 gtag 로드가 수 초 지연, 그 사이 클릭 이벤트가
            trackEvent의 무음 no-op으로 유실됨(cta_click 계측 수리, 2026-07-22).
            로드 지연 자체는 남아 있으나 <head> shim이 그 창의 이벤트를 dataLayer로 받아둔다. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
