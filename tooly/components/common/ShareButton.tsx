"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  description?: string;
}

export default function ShareButton({ title, description }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = () => {
    const Kakao = (window as unknown as { Kakao?: { Share?: { sendDefault: (params: Record<string, unknown>) => void }; isInitialized?: () => boolean; init?: (key: string) => void } }).Kakao;
    if (!Kakao?.Share) return;

    Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description: description || "",
        imageUrl: "",
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
        {copied ? "복사됨!" : "링크 복사"}
      </button>
      <button
        onClick={handleKakaoShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67-.15.56-.96 3.6-.99 3.83 0 0-.02.16.08.22.1.06.22.01.22.01.3-.04 3.44-2.27 3.98-2.65.65.1 1.33.15 2.05.15 5.52 0 10-3.58 10-7.94S17.52 3 12 3z" />
        </svg>
        카카오톡
      </button>
    </div>
  );
}
