import Link from "next/link";
import { getRelatedCalculators } from "@/lib/data/calculators";

interface RelatedCalculatorsProps {
  calculatorId: string;
}

export default function RelatedCalculators({
  calculatorId,
}: RelatedCalculatorsProps) {
  const related = getRelatedCalculators(calculatorId);
  if (related.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-text-primary">
        함께 많이 사용하는 계산기
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {related.map((calc) => (
          <Link
            key={calc.id}
            href={calc.path}
            className="rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm"
          >
            <div className="text-sm font-medium text-text-primary">
              {calc.name}
            </div>
            <div className="mt-1 text-xs text-text-secondary">
              {calc.description}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
