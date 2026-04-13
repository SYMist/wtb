import { VAT_RATE } from "@/lib/data/tax-rates";

export interface VatResult {
  supplyPrice: number; // 공급가액
  vat: number; // 부가세
  totalPrice: number; // 합계금액
  vatRate: number; // 부가세율 (%)
}

/** 공급가액 → 합계금액 */
export function calcVatFromSupply(
  supplyPrice: number,
  rate: number = VAT_RATE
): VatResult {
  const vat = Math.round(supplyPrice * rate);
  return {
    supplyPrice,
    vat,
    totalPrice: supplyPrice + vat,
    vatRate: rate * 100,
  };
}

/** 합계금액 → 공급가액 (부가세 추출) */
export function calcVatFromTotal(
  totalPrice: number,
  rate: number = VAT_RATE
): VatResult {
  const supplyPrice = Math.round(totalPrice / (1 + rate));
  const vat = totalPrice - supplyPrice;
  return {
    supplyPrice,
    vat,
    totalPrice,
    vatRate: rate * 100,
  };
}
