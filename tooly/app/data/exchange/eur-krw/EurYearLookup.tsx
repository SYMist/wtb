"use client";

import TrackedUserActionForm from "../../_components/TrackedUserActionForm";

export default function EurYearLookup({
  years,
  selectedYear,
}: {
  years: number[];
  selectedYear: number;
}) {
  return (
    <TrackedUserActionForm
      action="/data/exchange/eur-krw#year-lookup"
      className="flex flex-wrap items-end gap-3"
      eventName="eur_year_lookup_submit"
      eventParams={{ page: "exchange_eur_krw", action_origin: "year_lookup" }}
    >
      <label className="text-xs text-text-secondary">
        조회 연도
        <select
          name="year"
          defaultValue={String(selectedYear)}
          required
          className="mt-1 block min-w-36 rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
        >
          {years.map((year) => (
            <option value={year} key={year}>{year}년</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        연도 조회
      </button>
    </TrackedUserActionForm>
  );
}
