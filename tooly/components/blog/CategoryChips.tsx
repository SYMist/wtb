import Link from "next/link";
import { blogCategories } from "@/lib/blog/categories";

interface Props {
  activeId?: string;
}

export default function CategoryChips({ activeId }: Props) {
  const allActive = !activeId;

  return (
    <nav className="-mx-4 mb-8 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
      <div className="flex items-center gap-2 pb-2">
        <Link
          href="/blog"
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
            allActive
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          전체
        </Link>
        {blogCategories.map((cat) => {
          const active = activeId === cat.id;
          return (
            <Link
              key={cat.id}
              href={`/blog/category/${cat.id}`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
