import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "데이터 출처 | Tooly",
  description: "Tooly에서 사용하는 데이터의 출처와 면책 조항",
};

export default function DataSourcesPage() {
  return (
    <>
      <GNB />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-text-primary">
          데이터 출처 및 면책 조항
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-3 text-base font-semibold text-text-primary">
              데이터 출처
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-medium text-text-primary">
                      데이터
                    </th>
                    <th className="py-2 pr-4 font-medium text-text-primary">
                      출처
                    </th>
                    <th className="py-2 font-medium text-text-primary">
                      갱신 주기
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2 pr-4">기준금리</td>
                    <td className="py-2 pr-4">한국은행 (ECOS)</td>
                    <td className="py-2">금통위 결정 시</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">주담대 금리</td>
                    <td className="py-2 pr-4">금융감독원 금융상품 비교공시</td>
                    <td className="py-2">월 1회</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">환율</td>
                    <td className="py-2 pr-4">한국수출입은행</td>
                    <td className="py-2">매 영업일</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">4대보험 요율</td>
                    <td className="py-2 pr-4">
                      국민연금공단 / 국민건강보험공단 / 고용노동부
                    </td>
                    <td className="py-2">연 1회 (연초)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">소득세</td>
                    <td className="py-2 pr-4">국세청 근로소득 간이세액표</td>
                    <td className="py-2">세법 개정 시</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">양도소득세</td>
                    <td className="py-2 pr-4">국세청 / 소득세법</td>
                    <td className="py-2">세법 개정 시</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-text-primary">
              면책 조항
            </h2>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p>
                본 사이트에서 제공하는 모든 계산 결과는 <strong>참고용</strong>
                이며, 법적 효력이 없습니다.
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  실제 세금, 대출 조건, 금리 등은 관할 기관이나 금융기관에
                  직접 확인하시기 바랍니다.
                </li>
                <li>
                  계산 공식은 일반적인 경우를 기준으로 하며, 개인의 특수한
                  상황(비과세 한도, 감면 대상 등)은 반영되지 않을 수 있습니다.
                </li>
                <li>
                  데이터 갱신 시점에 따라 최신 정보와 차이가 있을 수 있습니다.
                </li>
                <li>
                  본 사이트의 계산 결과를 근거로 한 의사결정에 대해 Tooly는
                  어떠한 책임도 지지 않습니다.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
