export type UsageType = "residential" | "general";

/** 2026년 한전 주거용 전기요금 누진세 구간 (원/kWh) */
const RESIDENTIAL_TIERS = [
  { max: 200, rate: 120 },
  { max: 400, rate: 214.6 },
  { max: Infinity, rate: 307.3 },
];

/** 일반용 전기요금 (단일 단가 근사) */
const GENERAL_RATE = 160.3;

/** 기본요금 (원/호) */
const RESIDENTIAL_BASE_FEES = [
  { max: 200, fee: 910 },
  { max: 400, fee: 1600 },
  { max: Infinity, fee: 7300 },
];

export interface ElectricityResult {
  baseFee: number;
  usageFee: number;
  totalBeforeTax: number;
  vat: number; // 부가세 10%
  fund: number; // 전력산업기반기금 3.7%
  totalFee: number;
  tierBreakdown: { tier: string; kwh: number; rate: number; cost: number }[];
}

export function calculateElectricity(
  kwh: number,
  type: UsageType = "residential"
): ElectricityResult {
  if (type === "general") {
    const usageFee = Math.round(kwh * GENERAL_RATE);
    const baseFee = 6160;
    const totalBeforeTax = baseFee + usageFee;
    const vat = Math.round(totalBeforeTax * 0.1);
    const fund = Math.round(totalBeforeTax * 0.037);
    return {
      baseFee,
      usageFee,
      totalBeforeTax,
      vat,
      fund,
      totalFee: totalBeforeTax + vat + fund,
      tierBreakdown: [{ tier: "일반용", kwh, rate: GENERAL_RATE, cost: usageFee }],
    };
  }

  // 주거용 누진세
  let remaining = kwh;
  let usageFee = 0;
  const tierBreakdown: ElectricityResult["tierBreakdown"] = [];
  const tierLabels = ["1구간 (0~200kWh)", "2구간 (201~400kWh)", "3구간 (401kWh~)"];

  let prevMax = 0;
  for (let i = 0; i < RESIDENTIAL_TIERS.length; i++) {
    const tier = RESIDENTIAL_TIERS[i];
    const tierKwh = Math.min(remaining, tier.max - prevMax);
    if (tierKwh <= 0) break;
    const cost = Math.round(tierKwh * tier.rate);
    usageFee += cost;
    tierBreakdown.push({
      tier: tierLabels[i],
      kwh: tierKwh,
      rate: tier.rate,
      cost,
    });
    remaining -= tierKwh;
    prevMax = tier.max;
  }

  // 기본요금
  const baseTier = RESIDENTIAL_BASE_FEES.find((b) => kwh <= b.max) ?? RESIDENTIAL_BASE_FEES[2];
  const baseFee = baseTier.fee;

  const totalBeforeTax = baseFee + usageFee;
  const vat = Math.round(totalBeforeTax * 0.1);
  const fund = Math.round(totalBeforeTax * 0.037);

  return {
    baseFee,
    usageFee,
    totalBeforeTax,
    vat,
    fund,
    totalFee: totalBeforeTax + vat + fund,
    tierBreakdown,
  };
}
