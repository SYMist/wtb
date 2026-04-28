interface ComparisonTableProps {
  headersJson: string;
  rowsJson: string;
  highlightLastCol?: boolean;
}

export default function ComparisonTable({
  headersJson,
  rowsJson,
  highlightLastCol = false,
}: ComparisonTableProps) {
  const headers = JSON.parse(headersJson) as string[];
  const rows = JSON.parse(rowsJson) as string[][];

  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, cIdx) => {
                const emphasize = highlightLastCol && cIdx === row.length - 1;
                return (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 ${
                      cIdx === 0 ? "font-medium" : ""
                    } ${emphasize ? "font-bold text-indigo-600" : "text-slate-700"}`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
