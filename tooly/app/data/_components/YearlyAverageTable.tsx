import { buildYearlyRateAverages } from "@/lib/data/yearly-rate-average";

type Point = { date: string; rate: number };

interface YearlyAverageTableProps {
  series: Point[];
  label: string;
  /** 값 단위. 기본 "%". */
  unit?: string;
  /** 변화량 단위. 기본 "{unit}p". */
  changeUnit?: string;
}

/**
 * 연도별 평균 표(서버 렌더). 월별 표가 길어 스니펫에 앞부분만 잡히는 문제를 우회해,
 * 검색엔진이 통째로 인용할 수 있는 짧은 표를 제공한다.
 */
export default function YearlyAverageTable({
  series,
  label,
  unit = "%",
  changeUnit,
}: YearlyAverageTableProps) {
  const rows = buildYearlyRateAverages(series);
  const diffUnit = changeUnit ?? `${unit}p`;
  const partialYears = rows.filter((r) => r.months < 12);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-text-secondary">
            <tr>
              <th className="px-4 py-2 text-left font-medium">연도</th>
              <th className="px-4 py-2 text-right font-medium">
                연평균 ({unit})
              </th>
              <th className="px-4 py-2 text-right font-medium">전년 대비</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.year}>
                <td className="px-4 py-2 font-mono text-xs">
                  {row.year}년
                  {row.months < 12 && (
                    <span className="ml-1 font-sans text-[11px] text-text-secondary">
                      ({row.months}개월 평균)
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {row.average.toFixed(2)}
                  {unit}
                </td>
                <td
                  className={`px-4 py-2 text-right text-xs ${
                    (row.change ?? 0) > 0
                      ? "text-red-600"
                      : (row.change ?? 0) < 0
                        ? "text-blue-600"
                        : "text-text-secondary"
                  }`}
                >
                  {row.change === null || row.change === 0
                    ? "−"
                    : `${row.change > 0 ? "+" : ""}${row.change.toFixed(2)}${diffUnit}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-text-secondary">
        각 연도 월별 {label}의 산술평균
        {partialYears.length > 0 &&
          ` · ${partialYears.map((r) => `${r.year}년은 ${r.from}~${r.to} ${r.months}개월만 반영된 부분연도 평균`).join(", ")}`}
      </p>
    </div>
  );
}
