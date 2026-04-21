"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import("recharts").then((m) => m.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

type Point = { date: string; rate: number };

const RANGES = [
  { key: "1Y", label: "1년", months: 12 },
  { key: "5Y", label: "5년", months: 60 },
  { key: "10Y", label: "10년", months: 120 },
  { key: "ALL", label: "전체", months: Infinity },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

export default function BaseRateChart({ series }: { series: Point[] }) {
  const [range, setRange] = useState<RangeKey>("10Y");

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.key === range)!;
    return r.months === Infinity ? series : series.slice(-r.months);
  }, [range, series]);

  const tickInterval = Math.max(1, Math.floor(filtered.length / 6));

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              range === r.key
                ? "bg-primary text-white"
                : "bg-surface text-text-secondary hover:bg-border"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="h-72 w-full sm:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filtered}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              interval={tickInterval}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, "기준금리"]}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type="stepAfter"
              dataKey="rate"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
