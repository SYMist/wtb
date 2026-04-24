import type { TocItem } from "@/lib/blog/posts";

interface Props {
  items: TocItem[];
}

export default function TableOfContents({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <details className="group my-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-50" open>
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-bold text-slate-900 group-open:border-b group-open:border-slate-200">
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          목차
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-open:rotate-180"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>
      <nav className="space-y-1 p-4 text-sm text-slate-600">
        {items.map((item, i) => (
          <a
            key={i}
            href={`#${item.id}`}
            className={`block rounded px-2 py-1.5 transition-colors hover:bg-white hover:text-indigo-600 ${
              item.level === 3 ? "ml-4 text-slate-500" : ""
            }`}
          >
            {item.title}
          </a>
        ))}
      </nav>
    </details>
  );
}
