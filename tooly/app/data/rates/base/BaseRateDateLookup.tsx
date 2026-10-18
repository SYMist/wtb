"use client";

import TrackedUserActionForm from "../../_components/TrackedUserActionForm";

export default function BaseRateDateLookup({
  selectedDate,
  firstDate,
  checkedAt,
}: {
  selectedDate: string;
  firstDate: string;
  checkedAt: string;
}) {
  return (
    <TrackedUserActionForm
      action="/data/rates/base#decision-date"
      className="grid gap-3 sm:max-w-md sm:grid-cols-[1fr_auto]"
      eventName="base_rate_date_lookup_submit"
      eventParams={{ page: "rates_base", action_origin: "decision_date_lookup" }}
    >
      <label className="text-xs text-text-secondary">
        확인할 날짜
        <input
          type="date"
          name="date"
          defaultValue={selectedDate}
          min={firstDate}
          max={checkedAt}
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
        />
      </label>
      <button
        type="submit"
        className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
      >
        날짜 조회
      </button>
    </TrackedUserActionForm>
  );
}
