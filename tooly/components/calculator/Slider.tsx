"use client";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export default function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: SliderProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="tabular-nums text-sm font-semibold text-primary">
          {value.toLocaleString("ko-KR")}
          {unit && <span className="ml-0.5 text-text-secondary">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        style={{ minHeight: "44px" }}
      />
      <div className="mt-0.5 flex justify-between text-xs text-text-secondary">
        <span>
          {min.toLocaleString("ko-KR")}
          {unit}
        </span>
        <span>
          {max.toLocaleString("ko-KR")}
          {unit}
        </span>
      </div>
    </div>
  );
}
