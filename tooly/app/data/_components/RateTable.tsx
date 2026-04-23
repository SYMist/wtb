"use client";

import { useState } from "react";

type Point = { date: string; rate: number };

interface ValueFormat {
  unit?: string;       // "%" | "원"
  changeUnit?: string; // "%p" | "원"
  useCommas?: boolean;
  precision?: number;
}

interface RateTableProps {
  series: Point[];
  label: string;
  format?: ValueFormat;
}

function buildFormatter(opts: ValueFormat, forChange: boolean) {
  const unit = forChange
    ? (opts.changeUnit ?? `${opts.unit ?? "%"}p`)
    : (opts.unit ?? "%");
  const useCommas = opts.useCommas ?? false;
  const precision = opts.precision ?? 2;
  return (v: number) => {
    const abs = useCommas
      ? v.toLocaleString("ko-KR", {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })
      : v.toFixed(precision);
    return forChange && v > 0 ? `+${abs}${unit}` : `${abs}${unit}`;
  };
}

export default function RateTable({
  series,
  label,
  format = {},
}: RateTableProps) {
  const [expanded, setExpanded] = useState(false);
  const reversed = [...series].reverse();
  const rows = expanded ? reversed : reversed.slice(0, 24);

  const withChange = rows.map((row, i) => {
    const next = reversed[i + 1];
    const change = next ? row.rate - next.rate : 0;
    return { ...row, change };
  });

  const formatValue = buildFormatter(format, false);
  const formatChange = buildFormatter(format, true);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-2 text-left font-medium">기준월</th>
              <th className="px-4 py-2 text-right font-medium">{label}</th>
              <th className="px-4 py-2 text-right font-medium">전월 대비</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withChange.map((row) => (
              <tr key={row.date}>
                <td className="px-4 py-2 font-mono text-xs">{row.date}</td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatValue(row.rate)}
                </td>
                <td
                  className={`px-4 py-2 text-right text-xs ${
                    row.change > 0
                      ? "text-red-600"
                      : row.change < 0
                        ? "text-blue-600"
                        : "text-text-secondary"
                  }`}
                >
                  {row.change === 0 ? "−" : formatChange(row.change)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {series.length > 24 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 rounded-md border border-border bg-background px-4 py-2 text-xs text-text-secondary transition-colors hover:bg-surface"
        >
          {expanded ? "최근 24개월만 보기" : `전체 ${series.length}개월 보기`}
        </button>
      )}
    </div>
  );
}
