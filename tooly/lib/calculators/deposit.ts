import { INTEREST_TAX_RATES } from "@/lib/data/tax-rates";

export type ProductType = "savings" | "deposit"; // 적금 / 예금
export type InterestMethod = "simple" | "compound"; // 단리 / 월복리
export type TaxType = "normal" | "taxFree" | "preferential";

export interface DepositInput {
  amount: number; // 예치금액 (예금) / 월 적립액 (적금)
  annualRate: number; // 연이자율 %
  months: number;
  productType: ProductType;
  interestMethod?: InterestMethod; // 적금에만 적용
  taxType: TaxType;
}

export interface DepositResult {
  preTaxInterest: number;
  tax: number;
  postTaxInterest: number;
  maturityAmount: number;
  totalDeposited: number;
  taxRate: number;
}

export function calculateDeposit(input: DepositInput): DepositResult {
  const { amount, annualRate, months, productType, interestMethod, taxType } = input;
  const rate = annualRate / 100;
  const taxRate = INTEREST_TAX_RATES[taxType];
  let preTaxInterest: number;
  let totalDeposited: number;

  if (productType === "deposit") {
    // 정기예금: 단리
    preTaxInterest = Math.round(amount * rate * (months / 12));
    totalDeposited = amount;
  } else {
    // 적금
    totalDeposited = amount * months;
    if (interestMethod === "compound") {
      // 월복리
      const monthlyRate = rate / 12;
      let total = 0;
      for (let m = 0; m < months; m++) {
        total = (total + amount) * (1 + monthlyRate);
      }
      preTaxInterest = Math.round(total - totalDeposited);
    } else {
      // 단리
      preTaxInterest = Math.round(
        amount * rate * ((months * (months + 1)) / 2) / 12
      );
    }
  }

  const tax = Math.round(preTaxInterest * taxRate);
  const postTaxInterest = preTaxInterest - tax;
  const maturityAmount = totalDeposited + postTaxInterest;

  return {
    preTaxInterest,
    tax,
    postTaxInterest,
    maturityAmount,
    totalDeposited,
    taxRate: taxRate * 100,
  };
}
