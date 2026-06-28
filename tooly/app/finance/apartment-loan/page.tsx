import ApartmentLoanClient from "./ApartmentLoanClient";

// 점수 계산기("어디 살까")와 짝 = 대출 시뮬("감당되나").
// 백엔드/DB 없이 로컬스토리지·클라이언트 계산만 — 정적 프리렌더.
export default function ApartmentLoanPage() {
  return <ApartmentLoanClient />;
}
