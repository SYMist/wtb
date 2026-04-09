import Link from "next/link";
import { categories, getCalculatorsByCategory } from "@/lib/data/calculators";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Calculator sitemap */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((cat) => {
            const calcs = getCalculatorsByCategory(cat.id);
            return (
              <div key={cat.id}>
                <h3 className="mb-2 text-sm font-semibold text-text-primary">
                  {cat.name}
                </h3>
                <ul className="space-y-1">
                  {calcs.map((calc) => (
                    <li key={calc.id}>
                      <Link
                        href={calc.path}
                        className="text-xs text-text-secondary transition-colors hover:text-primary"
                      >
                        {calc.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} Tooly. 생활 계산기 & 도구 모음
          </p>
          <div className="flex gap-4 text-xs text-text-secondary">
            <Link href="/privacy" className="hover:text-primary">
              개인정보처리방침
            </Link>
            <Link href="/data-sources" className="hover:text-primary">
              데이터 출처
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
