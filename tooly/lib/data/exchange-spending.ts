import type { CurrencyMeta } from "./exchange-compare";

export type FeeMode = "separate" | "included";
export type QuoteInput = {
  rate: string;
  feeMode: FeeMode;
  percentFee: string;
  fixedFee: string;
};

export function emptyQuote(): QuoteInput {
  return { rate: "", feeMode: "separate", percentFee: "0", fixedFee: "0" };
}

/** Blank, exponent notation, separators and non-finite values are not zero. */
export function parseSpendingInput(
  raw: string,
  allowZero = false,
): number | null {
  const value = raw.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed > Number.MAX_SAFE_INTEGER) return null;
  return (allowZero ? parsed >= 0 : parsed > 0) ? parsed : null;
}

/** Changing modes discards extra fees so they cannot silently reappear later. */
export function changeFeeMode(quote: QuoteInput, feeMode: FeeMode): QuoteInput {
  return { ...quote, feeMode, percentFee: "0", fixedFee: "0" };
}

export function convertSpending(
  amount: number,
  rate: number,
  unit: number,
): number | null {
  if (
    ![amount, rate, unit].every(
      (v) => Number.isFinite(v) && v > 0 && v <= Number.MAX_SAFE_INTEGER,
    )
  ) {
    return null;
  }
  const result = (amount / unit) * rate;
  return Number.isFinite(result) &&
    result > 0 &&
    result <= Number.MAX_SAFE_INTEGER
    ? result
    : null;
}

export type QuoteCost = { baseKrw: number; feeKrw: number; totalKrw: number };

/** No intermediate rounding. Included quotes ignore even stale/invalid fee inputs. */
export function calculateQuote(
  amount: number,
  quote: QuoteInput,
  meta: Pick<CurrencyMeta, "unit">,
): QuoteCost | null {
  const rate = parseSpendingInput(quote.rate);
  if (rate === null) return null;
  const baseKrw = convertSpending(amount, rate, meta.unit);
  if (baseKrw === null) return null;
  if (quote.feeMode === "included")
    return { baseKrw, feeKrw: 0, totalKrw: baseKrw };
  if (quote.feeMode !== "separate") return null;
  const percentFee = parseSpendingInput(quote.percentFee, true);
  const fixedFee = parseSpendingInput(quote.fixedFee, true);
  if (percentFee === null || fixedFee === null) return null;
  const totalKrw = baseKrw * (1 + percentFee / 100) + fixedFee;
  if (
    !Number.isFinite(totalKrw) ||
    totalKrw <= 0 ||
    totalKrw > Number.MAX_SAFE_INTEGER
  )
    return null;
  return { baseKrw, feeKrw: totalKrw - baseKrw, totalKrw };
}

// Match the existing history cards: at most two decimals, rounding only for display.
export function formatSpendingWon(value: number, signed = false): string {
  return `${value.toLocaleString("ko-KR", {
    maximumFractionDigits: 2,
    signDisplay: signed ? "exceptZero" : "auto",
  })}원`;
}
