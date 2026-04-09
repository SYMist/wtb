"use client";

import { useCallback } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showSlider?: boolean;
  placeholder?: string;
}

function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

function parseNumber(s: string): number {
  const cleaned = s.replace(/[^0-9.-]/g, "");
  return Number(cleaned) || 0;
}

export default function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1_000_000_000,
  step = 1,
  unit,
  showSlider = false,
  placeholder,
}: NumberInputProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseNumber(e.target.value);
      const clamped = Math.min(Math.max(parsed, min), max);
      onChange(clamped);
    },
    [onChange, min, max]
  );

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={formatNumber(value)}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="tabular-nums w-full rounded-lg border border-border px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
              {unit}
            </span>
          )}
        </div>
      </div>
      {showSlider && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          style={{ minHeight: "44px" }}
        />
      )}
    </div>
  );
}
