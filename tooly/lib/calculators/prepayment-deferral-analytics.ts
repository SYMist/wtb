import { createCooldownTracker } from "@/lib/analytics";

export type PrepaymentAction = "calculate_compare" | "budget_reverse" | "schedule_edit" | "csv_export" | "calendar_export";
export type PrepaymentEvent = { name: "prepayment_deferral_action"; params: { page: "prepayment_deferral"; action_origin: PrepaymentAction } };

export function prepaymentActionEvent(actionOrigin: PrepaymentAction): PrepaymentEvent {
  return { name: "prepayment_deferral_action", params: { page: "prepayment_deferral", action_origin: actionOrigin } };
}

export function createPrepaymentActionTracker(send: (event: PrepaymentEvent) => void, now: () => number = Date.now): (actionOrigin: PrepaymentAction) => boolean {
  const trackers = new Map<PrepaymentAction, () => boolean>();
  return (actionOrigin) => {
    let tracker = trackers.get(actionOrigin);
    if (!tracker) {
      tracker = createCooldownTracker(() => send(prepaymentActionEvent(actionOrigin)), 750, now);
      trackers.set(actionOrigin, tracker);
    }
    return tracker();
  };
}
