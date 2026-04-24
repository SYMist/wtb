import Link from "next/link";
import type { Post } from "@/lib/blog/posts";
import { getBlogCategory } from "@/lib/blog/categories";

function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

export default function PostCard({ post }: { post: Post }) {
  const cat = getBlogCategory(post.category);

  return (
    <article className="group border-b border-slate-100 py-8 first:pt-0">
      <Link href={`/blog/${post.slug}`} className="flex items-start gap-6">
        <div className="flex-1 min-w-0">
          {cat && (
            <span className="mb-3 inline-block rounded-sm bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              {cat.name}
            </span>
          )}
          <h2 className="mb-2 text-[22px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-indigo-600">
            {post.title}
          </h2>
          <p className="mb-4 line-clamp-2 text-[15px] leading-relaxed text-slate-500">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>{post.readingMinutes}분 읽기</span>
            <span>·</span>
            <span>{post.author.name}</span>
          </div>
        </div>
        {post.thumbnail && (
          <div className="h-20 w-[120px] shrink-0 overflow-hidden rounded-lg border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    </article>
  );
}
