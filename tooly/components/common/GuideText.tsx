"use client";

import { useState, type ReactNode } from "react";

interface GuideTextProps {
  title?: string;
  children: ReactNode;
}

export default function GuideText({
  title = "이용 가이드",
  children,
}: GuideTextProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-text-secondary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {/* Always rendered in HTML for SEO, visually hidden when collapsed */}
      <div
        className={`overflow-hidden transition-all ${
          open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-text-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}
