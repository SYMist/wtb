import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import SearchBar from "@/components/common/SearchBar";
import KillerCards from "@/components/common/KillerCards";
import CategoryTabs from "@/components/common/CategoryTabs";
import { getAllPosts } from "@/lib/blog/posts";

export default function HomePage() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              생활 계산, 한 번에 해결
            </h1>
            <p className="mt-3 text-text-secondary">
              정확한 공식과 최신 데이터로 빠르게 계산하세요
            </p>
            <div className="mt-8">
              <SearchBar size="lg" />
            </div>
            <Link
              href="/data/rates"
              className="group mt-4 flex items-center gap-4 rounded-xl border border-border bg-background/70 p-4 text-left transition-all hover:border-primary hover:shadow-md"
            >
              <div className="text-2xl leading-none">📊</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary transition-colors group-hover:text-primary">
                  금리 데이터 모음
                </div>
                <div className="mt-0.5 text-xs text-text-secondary">
                  기준금리·주담대·예금·국고채 시계열
                </div>
              </div>
              <div className="text-text-secondary transition-colors group-hover:text-primary">
                →
              </div>
            </Link>
          </div>
        </section>

        {/* Killer calculators */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="mb-6 text-xl font-bold text-text-primary">
            인기 계산기
          </h2>
          <KillerCards />
        </section>

        {/* Category tabs + grid */}
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-6 text-xl font-bold text-text-primary">
            카테고리별 계산기
          </h2>
          <CategoryTabs />
        </section>

        {/* Recent blog posts */}
        {recentPosts.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">최신 콘텐츠</h2>
              <Link href="/blog" className="text-sm text-primary hover:underline">
                전체 보기 →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-border p-5 transition-all hover:border-primary hover:shadow-md"
                >
                  <span className="inline-block rounded-full bg-surface px-2.5 py-0.5 text-xs text-text-secondary mb-3">
                    {post.category}
                  </span>
                  <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-text-secondary">{post.date}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
