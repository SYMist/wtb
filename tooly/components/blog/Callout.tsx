import type { ReactNode } from "react";

type CalloutType = "tip" | "warning" | "info" | "important";

const STYLES: Record<
  CalloutType,
  { box: string; title: string; body: string; icon: ReactNode }
> = {
  tip: {
    box: "bg-blue-50 border-l-4 border-blue-500",
    title: "text-blue-900",
    body: "text-blue-900/80",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  warning: {
    box: "bg-orange-50 border-l-4 border-orange-500",
    title: "text-orange-900",
    body: "text-orange-900/80",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    box: "bg-slate-50 border-l-4 border-slate-400",
    title: "text-slate-900",
    body: "text-slate-700",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  important: {
    box: "bg-indigo-50 border-l-4 border-indigo-500",
    title: "text-indigo-900",
    body: "text-indigo-900/80",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export default function Callout({ type = "info", title, children }: CalloutProps) {
  const s = STYLES[type];
  return (
    <div className={`flex gap-4 rounded-r-lg p-5 my-6 ${s.box}`}>
      <span className={`shrink-0 ${s.title}`}>{s.icon}</span>
      <div className="flex-1">
        {title && <strong className={`block mb-1 font-bold ${s.title}`}>{title}</strong>}
        <div className={`text-sm leading-relaxed ${s.body}`}>{children}</div>
      </div>
    </div>
  );
}
