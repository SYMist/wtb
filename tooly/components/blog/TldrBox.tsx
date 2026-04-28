interface TldrBoxProps {
  items: string[];
}

export default function TldrBox({ items }: TldrBoxProps) {
  if (!items || items.length === 0) return null;

  return (
    <aside className="my-10 rounded-r-xl border-l-4 border-indigo-600 bg-indigo-50 p-6">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-indigo-900">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        핵심 요약 (TL;DR)
      </h2>
      <ul className="space-y-2 text-[15px] leading-relaxed text-indigo-900/90">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
