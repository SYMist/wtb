import CapitalGainsTaxClient from "./CapitalGainsTaxClient";

// searchParams를 서버에서 읽지 않으므로 정적 프리렌더된다(no-store 제거).
// 딥링크 프리셋은 CapitalGainsTaxClient가 마운트 후 클라이언트에서 적용.
export default function CapitalGainsTaxPage() {
  return <CapitalGainsTaxClient />;
}
