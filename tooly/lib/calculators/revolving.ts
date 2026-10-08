export const MAX_REVOLVING_MONTHS = 60;
export const MAX_REVOLVING_WON = 1_000_000_000_000;

export interface RevolvingInput {
  /** Principal already carried into the first simulated billing cycle. */
  initialRolloverPrincipal: number;
  /** User's contract annual revolving fee rate, in percent. */
  annualFeeRatePercent: number;
  /** Contractual principal payment percentage, in percent. */
  paymentRatePercent: number;
  /** New eligible lump-sum purchases first billed in each simulated month. */
  monthlyNewPurchases: number;
  months: number;
}

export interface RevolvingMonth {
  month: number;
  openingPrincipal: number;
  newPurchases: number;
  principalBeforePayment: number;
  fee: number;
  principalPaid: number;
  totalPayment: number;
  endingPrincipal: number;
  cumulativeFee: number;
  cumulativePrincipalPaid: number;
  cumulativePayment: number;
}

export interface RevolvingResult {
  input: RevolvingInput;
  schedule: RevolvingMonth[];
  totalNewPurchases: number;
  totalPrincipalPaid: number;
  totalFee: number;
  totalPayment: number;
  endingPrincipal: number;
  eligiblePrincipalTotal: number;
  /** First month the modeled carried principal reaches zero; null if it does not. */
  payoffMonth: number | null;
}

function finiteInRange(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function normalizeInput(input: RevolvingInput): RevolvingInput {
  return {
    initialRolloverPrincipal: Math.round(
      finiteInRange(input.initialRolloverPrincipal, 0, MAX_REVOLVING_WON, 0),
    ),
    annualFeeRatePercent: finiteInRange(input.annualFeeRatePercent, 0, 100, 0),
    paymentRatePercent: finiteInRange(input.paymentRatePercent, 1, 100, 30),
    monthlyNewPurchases: Math.round(
      finiteInRange(input.monthlyNewPurchases, 0, MAX_REVOLVING_WON, 0),
    ),
    months: Math.round(finiteInRange(input.months, 1, MAX_REVOLVING_MONTHS, 12)),
  };
}

/**
 * Monthly approximation of revolving-card principal and fee behavior.
 * Fees are charged separately on the prior carried principal; they are never
 * added to principal. New purchases first accrue a fee in the following cycle
 * only if some principal from that statement is carried forward.
 */
export function calculateRevolving(input: RevolvingInput): RevolvingResult {
  const normalized = normalizeInput(input);
  const monthlyRate = normalized.annualFeeRatePercent / 100 / 12;
  const paymentRate = normalized.paymentRatePercent / 100;
  const schedule: RevolvingMonth[] = [];

  let principal = normalized.initialRolloverPrincipal;
  let cumulativeFee = 0;
  let cumulativePrincipalPaid = 0;
  let cumulativePayment = 0;
  let payoffMonth: number | null = null;

  for (let month = 1; month <= normalized.months; month += 1) {
    const openingPrincipal = principal;
    const newPurchases = normalized.monthlyNewPurchases;
    const principalBeforePayment = openingPrincipal + newPurchases;
    const fee = Math.round(openingPrincipal * monthlyRate);
    const scheduledPrincipalPayment = Math.round(
      principalBeforePayment * paymentRate,
    );
    // Avoid a positive balance becoming permanently stuck solely because its
    // rounded percentage payment is below one won. This is a simulator guard,
    // not a card issuer's minimum-payment rule.
    const principalPaid =
      principalBeforePayment === 0
        ? 0
        : Math.min(
            principalBeforePayment,
            Math.max(1, scheduledPrincipalPayment),
          );
    principal = Math.max(0, principalBeforePayment - principalPaid);
    const totalPayment = principalPaid + fee;

    cumulativeFee += fee;
    cumulativePrincipalPaid += principalPaid;
    cumulativePayment += totalPayment;

    if (openingPrincipal > 0 && principal === 0 && payoffMonth === null) {
      payoffMonth = month;
    }

    schedule.push({
      month,
      openingPrincipal,
      newPurchases,
      principalBeforePayment,
      fee,
      principalPaid,
      totalPayment,
      endingPrincipal: principal,
      cumulativeFee,
      cumulativePrincipalPaid,
      cumulativePayment,
    });
  }

  const totalNewPurchases = normalized.monthlyNewPurchases * normalized.months;
  return {
    input: normalized,
    schedule,
    totalNewPurchases,
    totalPrincipalPaid: cumulativePrincipalPaid,
    totalFee: cumulativeFee,
    totalPayment: cumulativePayment,
    endingPrincipal: principal,
    eligiblePrincipalTotal:
      normalized.initialRolloverPrincipal + totalNewPurchases,
    payoffMonth,
  };
}

export interface RevolvingYearSummary {
  label: string;
  firstMonth: number;
  lastMonth: number;
  newPurchases: number;
  principalPaid: number;
  fee: number;
  totalPayment: number;
  endingPrincipal: number;
}

export function summarizeRevolvingByYear(
  result: RevolvingResult,
): RevolvingYearSummary[] {
  const summaries: RevolvingYearSummary[] = [];
  for (let start = 0; start < result.schedule.length; start += 12) {
    const rows = result.schedule.slice(start, start + 12);
    const first = rows[0];
    const last = rows[rows.length - 1];
    if (!first || !last) continue;
    summaries.push({
      label:
        rows.length === 12
          ? `${Math.ceil(first.month / 12)}년차`
          : `${first.month}~${last.month}개월`,
      firstMonth: first.month,
      lastMonth: last.month,
      newPurchases: rows.reduce((sum, row) => sum + row.newPurchases, 0),
      principalPaid: rows.reduce((sum, row) => sum + row.principalPaid, 0),
      fee: rows.reduce((sum, row) => sum + row.fee, 0),
      totalPayment: rows.reduce((sum, row) => sum + row.totalPayment, 0),
      endingPrincipal: last.endingPrincipal,
    });
  }
  return summaries;
}
