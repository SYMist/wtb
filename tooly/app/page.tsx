import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import SearchBar from "@/components/common/SearchBar";
import KillerCards from "@/components/common/KillerCards";
import CategoryTabs from "@/components/common/CategoryTabs";

export default function HomePage() {
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
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="mb-6 text-xl font-bold text-text-primary">
            카테고리별 계산기
          </h2>
          <CategoryTabs />
        </section>
      </main>
      <Footer />
    </>
  );
}
