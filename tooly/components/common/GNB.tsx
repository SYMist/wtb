"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories, getCalculatorsByCategory } from "@/lib/data/calculators";
import SearchModal from "./SearchModal";

export default function GNB() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            Tooly
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {categories.map((cat) => {
              const isActive = pathname.startsWith(cat.path);
              return (
                <li
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => setHoveredCategory(cat.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={cat.path}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface ${
                      isActive
                        ? "text-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {cat.name}
                  </Link>
                  {/* Dropdown */}
                  {hoveredCategory === cat.id && (
                    <div className="absolute left-0 top-full pt-1">
                      <div className="min-w-48 rounded-lg border border-border bg-background p-2 shadow-lg">
                        {getCalculatorsByCategory(cat.id).map((calc) => (
                          <Link
                            key={calc.id}
                            href={calc.path}
                            className="block rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                          >
                            {calc.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
              aria-label="검색"
            >
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface md:hidden"
              aria-label="메뉴"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                {mobileOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border bg-background px-4 py-2 md:hidden">
            {categories.map((cat) => {
              const calcs = getCalculatorsByCategory(cat.id);
              const isActive = pathname.startsWith(cat.path);
              return (
                <div key={cat.id} className="py-2">
                  <Link
                    href={cat.path}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-sm font-medium ${
                      isActive ? "text-primary" : "text-text-primary"
                    }`}
                  >
                    {cat.name}
                  </Link>
                  <div className="mt-1 ml-3 space-y-1">
                    {calcs.map((calc) => (
                      <Link
                        key={calc.id}
                        href={calc.path}
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm text-text-secondary hover:text-primary"
                      >
                        {calc.name}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </header>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </>
  );
}
