import type { FaqItem } from "@/lib/blog/posts";

interface Props {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="my-10">
      <h2 className="mb-6 border-l-4 border-indigo-600 pl-3 text-xl font-bold text-slate-900">
        자주 묻는 질문 (FAQ)
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-slate-200 bg-white"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-bold text-slate-900">
              <span className="pr-4">
                Q{i + 1}. {item.q}
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
                className="shrink-0 transition-transform group-open:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="border-t border-slate-100 p-4 text-sm leading-relaxed text-slate-600">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
