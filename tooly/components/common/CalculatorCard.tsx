import Link from "next/link";
import type { Calculator } from "@/lib/data/calculators";

export default function CalculatorCard({ calc }: { calc: Calculator }) {
  return (
    <Link
      href={calc.path}
      className="group rounded-lg border border-border p-5 transition-all hover:border-primary hover:shadow-md"
    >
      <div className="mb-3 text-3xl leading-none">{calc.icon}</div>
      <h2 className="text-base font-semibold text-text-primary transition-colors group-hover:text-primary">
        {calc.name}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
        {calc.description}
      </p>
    </Link>
  );
}
