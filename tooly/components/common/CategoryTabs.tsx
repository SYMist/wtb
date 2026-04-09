"use client";

import { useState } from "react";
import Link from "next/link";
import {
  categories,
  getCalculatorsByCategory,
  type Category,
} from "@/lib/data/calculators";

export default function CategoryTabs() {
  const [activeTab, setActiveTab] = useState<Category>("finance");

  const calcs = getCalculatorsByCategory(activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === cat.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {calcs.map((calc) => (
          <Link
            key={calc.id}
            href={calc.path}
            className="rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm"
          >
            <div className="text-sm font-medium text-text-primary">
              {calc.name}
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              {calc.description}
            </div>
          </Link>
        ))}
        {calcs.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-text-secondary">
            준비 중입니다
          </p>
        )}
      </div>
    </div>
  );
}
