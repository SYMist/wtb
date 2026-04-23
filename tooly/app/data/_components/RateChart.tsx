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

export interface ValueFormat {
  unit?: string; // "%" or "원"
  useCommas?: boolean; // thousands separator
  precision?: number; // decimal places for tooltip
  tickPrecision?: number; // decimal places for y-axis ticks
  hideTickUnit?: boolean; // omit unit on y-axis tick labels
}

interface RateChartProps {
  series: Point[];
  label: string;
  color?: string;
  interpolation?: "stepAfter" | "monotone";
  defaultRange?: RangeKey;
  format?: ValueFormat;
}

function buildFormatter(opts: ValueFormat, forTick: boolean) {
  const unit = opts.unit ?? "%";
  const useCommas = opts.useCommas ?? false;
  const precision = forTick
    ? (opts.tickPrecision ?? opts.precision ?? 0)
    : (opts.precision ?? 2);
  const showUnit = forTick ? !opts.hideTickUnit : true;
  return (v: number) => {
    const num = useCommas
      ? v.toLocaleString("ko-KR", {
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        })
      : v.toFixed(precision);
    return showUnit ? `${num}${unit}` : num;
  };
}

export default function RateChart({
  series,
  label,
  color = "#2563eb",
  interpolation = "stepAfter",
  defaultRange = "10Y",
  format = {},
}: RateChartProps) {
  const [range, setRange] = useState<RangeKey>(defaultRange);

  const filtered = useMemo(() => {
    const r = RANGES.find((x) => x.key === range)!;
    return r.months === Infinity ? series : series.slice(-r.months);
  }, [range, series]);

  const tickInterval = Math.max(1, Math.floor(filtered.length / 6));
  const formatValue = buildFormatter(format, false);
  const formatTick = buildFormatter(format, true);

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
              tickFormatter={(v) => formatTick(v as number)}
            />
            <Tooltip
              formatter={(v) => [formatValue(v as number), label]}
              labelStyle={{ fontSize: 12 }}
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type={interpolation}
              dataKey="rate"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
