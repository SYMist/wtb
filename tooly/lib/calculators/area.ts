const PYEONG_TO_SQM = 3.305785;

export function pyeongToSqm(pyeong: number): number {
  return Math.round(pyeong * PYEONG_TO_SQM * 100) / 100;
}

export function sqmToPyeong(sqm: number): number {
  return Math.round((sqm / PYEONG_TO_SQM) * 100) / 100;
}

export interface ApartmentSize {
  pyeong: number;
  sqm: number;
  label: string;
}

export const commonApartmentSizes: ApartmentSize[] = [
  { pyeong: 18, sqm: pyeongToSqm(18), label: "18평형 (소형)" },
  { pyeong: 24, sqm: pyeongToSqm(24), label: "24평형 (국민)" },
  { pyeong: 32, sqm: pyeongToSqm(32), label: "32평형 (중형)" },
  { pyeong: 42, sqm: pyeongToSqm(42), label: "42평형 (중대형)" },
  { pyeong: 52, sqm: pyeongToSqm(52), label: "52평형 (대형)" },
  { pyeong: 63, sqm: pyeongToSqm(63), label: "63평형 (초대형)" },
];
