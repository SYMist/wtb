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
        {/* GA4 표준 스니펫 — 파싱 시점 동기 실행. js·config가 dataLayer에 항상 먼저 들어간다.
            gtag.js는 큐를 순서대로 처리하고 config보다 앞선 이벤트는 보낼 대상 태그가 없어 버린다.
            init을 afterInteractive에 두면 하이드레이션 시점에 도는 마운트 effect(CompareRunTracker)가
            config보다 앞서 큐잉돼 폐기됐다 — 8/14 GA4 실시간 실측으로 확인, 여기로 올려 순서를
            구조로 보장한다. (지연 훅으로 덮는 처방은 재발 구조라 금지.)
            next/script beforeInteractive는 app router에서 인라인을 self.__next_s 런타임 큐로
            우회시켜 파싱 시점 동기 실행이 안 되므로 쓰지 않는다(2026-08-11 실측). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
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

        {/* gtag.js 로더만 남긴다 — 초기화(js·config)는 <head> 인라인으로 이전(2026-08-14).
            src가 늦게 로드돼도 dataLayer를 순서대로 재생하므로 js → config → event가 보장된다.
            여기에 config를 다시 두면 page_view가 이중계수된다. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
