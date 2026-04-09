import Link from "next/link";
import { getKillerCalculators } from "@/lib/data/calculators";

const iconMap: Record<string, string> = {
  "loan-calculator": "🏠",
  "salary-calculator": "💰",
  "compound-interest": "📈",
};

export default function KillerCards() {
  const killers = getKillerCalculators();

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {killers.map((calc) => (
        <Link
          key={calc.id}
          href={calc.path}
          className="group rounded-xl border border-border p-6 transition-all hover:border-primary hover:shadow-md"
        >
          <div className="text-3xl">{iconMap[calc.id] || "🔢"}</div>
          <h3 className="mt-3 text-base font-semibold text-text-primary group-hover:text-primary">
            {calc.name}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">{calc.description}</p>
        </Link>
      ))}
    </div>
  );
}
