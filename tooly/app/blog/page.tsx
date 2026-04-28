import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import PostCard from "@/components/blog/PostCard";
import CategoryChips from "@/components/blog/CategoryChips";
import { getAllPosts } from "@/lib/blog/posts";

const PAGE_URL = "https://tooly.deluxo.co.kr/blog";

export const metadata: Metadata = {
  title: "Tooly Blog — 계산기 가이드 · 금융 상식 · 데이터 분석",
  description:
    "Tooly 계산기를 실전에서 활용하는 방법부터 세금·대출·투자 관련 실용 지식까지. AI·검색엔진 친화 구조로 정리한 금융 콘텐츠 블로그.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Tooly Blog",
    description: "계산기 가이드와 금융 상식, 데이터 분석 콘텐츠.",
    url: PAGE_URL,
    type: "website",
  },
};

export default function BlogListPage() {
  const posts = getAllPosts();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: "https://tooly.deluxo.co.kr" },
      { "@type": "ListItem", position: 2, name: "블로그", item: PAGE_URL },
    ],
  };

  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">›</span>
          <span>블로그</span>
        </nav>

        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-slate-900">
            Tooly Blog
          </h1>
          <p className="text-[15px] leading-relaxed text-slate-600">
            계산기를 200% 활용하는 방법과 일상에서 유용한 금융 지식을 전합니다.
          </p>
        </header>

        <CategoryChips />

        {posts.length === 0 ? (
          <p className="py-20 text-center text-slate-400">
            아직 발행된 포스트가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </main>
      <Footer />
    </>
  );
}
