import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tooly - 생활 계산기 & 도구 모음",
    template: "%s | Tooly",
  },
  description:
    "주택대출, 연봉 실수령액, 복리 계산 등 생활에 필요한 계산기를 한곳에서. 정확한 공식과 최신 데이터로 빠르게 계산하세요.",
  metadataBase: new URL("https://tooly.kr"),
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
