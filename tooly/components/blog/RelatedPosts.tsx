import Link from "next/link";
import type { Post } from "@/lib/blog/posts";
import { getBlogCategory } from "@/lib/blog/categories";

export default function RelatedPosts({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="mb-6 text-xl font-bold text-slate-900">함께 보면 좋은 글</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {posts.map((p) => {
          const cat = getBlogCategory(p.category);
          return (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block"
            >
              <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-indigo-100 via-slate-100 to-indigo-50">
                {p.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              {cat && (
                <span className="mb-1 inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  {cat.name}
                </span>
              )}
              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-indigo-600">
                {p.title}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
