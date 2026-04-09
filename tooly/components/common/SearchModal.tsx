"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchCalculators, type Calculator } from "@/lib/data/calculators";

interface SearchModalProps {
  onClose: () => void;
}

export default function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Calculator[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setResults(searchCalculators(query));
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = (calc: Calculator) => {
    router.push(calc.path);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[15vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-border bg-background p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <svg
            width="20"
            height="20"
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
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="무엇을 계산할까요?"
            className="flex-1 bg-transparent text-base outline-none placeholder:text-text-secondary"
          />
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface"
          >
            ESC
          </button>
        </div>

        {results.length > 0 && (
          <ul className="mt-2 max-h-64 overflow-y-auto">
            {results.map((calc) => (
              <li key={calc.id}>
                <button
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
              </li>
            ))}
          </ul>
        )}

        {query && results.length === 0 && (
          <p className="py-8 text-center text-sm text-text-secondary">
            검색 결과가 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
