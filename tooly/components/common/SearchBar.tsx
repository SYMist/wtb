"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchCalculators, type Calculator } from "@/lib/data/calculators";

interface SearchBarProps {
  size?: "lg" | "md";
}

export default function SearchBar({ size = "md" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Calculator[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setResults(searchCalculators(query));
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (calc: Calculator) => {
    router.push(calc.path);
    setOpen(false);
    setQuery("");
  };

  const isLarge = size === "lg";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`flex items-center gap-3 rounded-xl border border-border bg-background shadow-sm transition-shadow focus-within:border-primary focus-within:shadow-md ${
          isLarge ? "px-5 py-4" : "px-4 py-2.5"
        }`}
      >
        <svg
          width={isLarge ? 24 : 20}
          height={isLarge ? 24 : 20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="shrink-0 text-text-secondary"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="무엇을 계산할까요?"
          className={`flex-1 bg-transparent outline-none placeholder:text-text-secondary ${
            isLarge ? "text-lg" : "text-base"
          }`}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-lg">
          {results.map((calc) => (
            <button
              key={calc.id}
              onClick={() => handleSelect(calc)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface"
            >
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {calc.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {calc.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
