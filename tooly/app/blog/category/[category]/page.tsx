import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import PostCard from "@/components/blog/PostCard";
import CategoryChips from "@/components/blog/CategoryChips";
import { getPostsByCategory } from "@/lib/blog/posts";
import { blogCategories, getBlogCategory } from "@/lib/blog/categories";

const BASE_URL = "https://tooly.deluxo.co.kr";

interface Params {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return blogCategories.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const cat = getBlogCategory(category);
  if (!cat) return {};
  const url = `${BASE_URL}/blog/category/${category}`;
  return {
    title: `${cat.name} — Tooly Blog`,
    description: cat.description,
    alternates: { canonical: url },
    openGraph: { title: `${cat.name} — Tooly Blog`, url, type: "website" },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const cat = getBlogCategory(category);
  if (!cat) notFound();

  const posts = getPostsByCategory(category);

  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">›</span>
          <Link href="/blog" className="hover:text-primary">블로그</Link>
          <span className="mx-1">›</span>
          <span>{cat.name}</span>
        </nav>

        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            {cat.name}
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-600">{cat.description}</p>
        </header>

        <CategoryChips activeId={category} />

        {posts.length === 0 ? (
          <p className="py-20 text-center text-slate-400">
            이 카테고리에 아직 포스트가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
