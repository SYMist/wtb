"use client";

import { useState } from "react";

type Point = { date: string; rate: number };

interface RateTableProps {
  series: Point[];
  label: string;
}

export default function RateTable({ series, label }: RateTableProps) {
  const [expanded, setExpanded] = useState(false);
  const reversed = [...series].reverse();
  const rows = expanded ? reversed : reversed.slice(0, 24);

  const withChange = rows.map((row, i) => {
    const next = reversed[i + 1];
    const change = next ? row.rate - next.rate : 0;
    return { ...row, change };
  });

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
                  {row.rate.toFixed(2)}%
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
                  {row.change === 0
                    ? "−"
                    : `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}%p`}
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
