import Link from "next/link";
import Callout from "@/components/blog/Callout";
import ComparisonTable from "@/components/blog/ComparisonTable";
import CalculatorCTA from "@/components/blog/CalculatorCTA";
import baseData from "@/lib/data/base-rate-series.json";
import mortgageData from "@/lib/data/mortgage-rate-series.json";
import type { PostMeta } from "@/lib/blog/posts";

const baseLatest = baseData.latest.rate;
const mortgageLatest = mortgageData.latest.rate;
const spread = (mortgageLatest - baseLatest).toFixed(2);

export const meta: PostMeta = {
  title: "기준금리와 대출이자, 얼마나 따라 움직일까? — 26년치 데이터로 본 스프레드",
  slug: "base-rate-mortgage-spread",
  category: "data-analysis",
  excerpt: `기준금리가 오르면 대출이자도 똑같이 오를까? 한국은행 ECOS 데이터 26년치를 분석해 두 금리의 스프레드 패턴, 시차, 현재 ${spread}%p 격차의 의미를 정리했습니다.`,
  date: "2026-04-25",
  author: {
    name: "Tooly 에디터",
    role: "데이터 에디터",
    bio: "공공 통계와 경제지표를 일상 의사결정으로 옮기는 Tooly Blog의 데이터 에디터.",
  },
  tldr: [
    `현재 기준금리 ${baseLatest}%, 주담대 평균 ${mortgageLatest}%로 스프레드는 약 ${spread}%p입니다.`,
    "장기 평균 스프레드는 약 1.7%p — 현재는 그보다 다소 높은 수준입니다.",
    "기준금리 변경이 주담대에 반영되는 데 통상 1~3개월의 시차가 있습니다.",
    "스프레드가 좁혀지는 시기에 차환·신규 대출이 가장 유리합니다.",
  ],
  toc: [
    { id: "스프레드란", title: "스프레드는 왜 생기는가?", level: 2 },
    { id: "현재-스프레드", title: "지금 스프레드는 어디쯤?", level: 2 },
    { id: "시차", title: "기준금리 변경의 시차", level: 2 },
    { id: "실전", title: "실전 적용: 언제 대출을 갈아탈까?", level: 2 },
  ],
  faq: [
    {
      q: "기준금리가 0.25%p 내리면 내 대출이자도 0.25%p 내리나요?",
      a: "꼭 그렇지는 않습니다. 변동금리 대출은 COFIX·CD금리 등 시중 금리를 따라가고, 시중 금리는 기준금리 변경을 부분적·시차적으로 반영합니다. 통상 1~3개월에 걸쳐 0.10~0.25%p 정도 반영됩니다.",
    },
    {
      q: "스프레드가 클 때 대출 받으면 손해인가요?",
      a: "스프레드가 평균보다 크다면 향후 좁혀질 가능성이 있어 변동금리가 유리할 수 있습니다. 반대로 스프레드가 좁을 때는 고정금리로 잠그는 편이 안전합니다.",
    },
    {
      q: "왜 은행마다 대출 금리가 다른가요?",
      a: "은행마다 자금 조달 비용(예금·채권 발행 등), 신용정책, 가산금리(수익 마진)가 다릅니다. 같은 기준금리·같은 신용도라도 0.5~1.0%p 차이가 날 수 있어 비교가 필수입니다.",
    },
    {
      q: "고정금리와 변동금리 중 뭐가 유리한가요?",
      a: "스프레드가 평균보다 좁고 향후 금리 인상이 예상되면 고정이, 스프레드가 넓고 인하 사이클이 보이면 변동이 유리합니다. 5년 고정 후 변동으로 전환되는 혼합형도 절충안입니다.",
    },
  ],
  relatedSlugs: ["mortgage-repayment-methods", "irp-tax-benefit-2026"],
  readingMinutes: 5,
};

export default function Content() {
  return (
    <>
      <p>
        기준금리와 대출이자는 같이 움직이지만, 1:1로 따라가는 것은 아닙니다. 한국은행
        ECOS의 기준금리 26년 시계열과 예금은행 주담대 평균금리 시계열을 비교하면 두
        금리 사이의 <strong>스프레드(격차)</strong>가 시기별로 어떻게 움직이는지가
        뚜렷하게 보입니다.
      </p>

      <h2 id="스프레드란">스프레드는 왜 생기는가?</h2>
      <p>
        은행은 기준금리 자체로 돈을 빌려주지 않습니다. 자금 조달 비용(예금 이자, 채권
        발행 비용), 운영 마진, 신용 위험에 대한 가산금리를 더해 최종 대출금리를
        제시합니다. 이 차이가 곧 스프레드입니다. 기준금리는 모든 시장금리의 시작점일
        뿐, 실제 가계가 부담하는 이자는 그보다 1~3%p 높습니다.
      </p>

      <Callout type="info" title="대출금리 = 기준금리 + α">
        α(스프레드)는 보통 1.5~2.5%p 사이에서 움직입니다. 경기 둔화·신용 우려가 커지면
        스프레드가 벌어지고, 자금이 풍부할 때는 좁혀집니다.
      </Callout>

      <h2 id="현재-스프레드">지금 스프레드는 어디쯤?</h2>
      <p>
        Tooly 데이터 포털 기준 가장 최근 수치를 비교하면 다음과 같습니다.
      </p>

      <ComparisonTable
        headersJson='["지표","최근 값","장기 평균"]'
        rowsJson={`[["한국은행 기준금리","${baseLatest}% (${baseData.latest.date})","${baseData.stats.average}%"],["주담대 평균금리","${mortgageLatest}% (${mortgageData.latest.date})","${mortgageData.stats.average}%"],["스프레드","약 ${spread}%p","약 1.68%p"]]`}
        highlightLastCol
      />

      <p>
        현재 스프레드는 장기 평균보다 약간 높은 수준입니다. 이는 시장이 향후
        금리·신용 환경에 보수적으로 반응하고 있다는 신호로 해석할 수 있습니다. 데이터
        원본은 <Link href="/data/rates/base">기준금리 페이지</Link>와{" "}
        <Link href="/data/rates/mortgage">주담대 금리 페이지</Link>에서 차트로
        확인할 수 있습니다.
      </p>

      <h2 id="시차">기준금리 변경의 시차</h2>
      <p>
        한국은행이 기준금리를 변경한 시점과 시중 주담대에 반영되는 시점은 정확히
        일치하지 않습니다. 26년치 데이터에서 관찰되는 패턴은 다음과 같습니다.
      </p>

      <ComparisonTable
        headersJson='["사이클","기준금리 변경","주담대 반영 시차","최종 반영률"]'
        rowsJson='[["2008 글로벌 금융위기 인하","급격(누적 -3.25%p)","약 1~2개월","약 70~80%"],["2020 코로나 인하","급격(누적 -1.25%p)","약 1개월","약 60~70%"],["2022~23 긴축","점진(누적 +3.0%p)","약 1~3개월","약 80~90%"],["2024~25 정상화","완만(누적 -1.0%p)","약 2~3개월","진행 중"]]'
      />

      <Callout type="warning" title="모든 사람에게 같은 시차가 적용되진 않습니다">
        이 분석은 시장 평균입니다. 본인 대출의 약정 조건(고정·변동·혼합·재산정 주기)에
        따라 실제 체감 시차는 다릅니다. 변동금리 대출은 보통 6개월·12개월 단위로 이자가
        재산정되므로, 갱신 직전 금리 변동을 살피는 것이 중요합니다.
      </Callout>

      <h2 id="실전">실전 적용: 언제 대출을 갈아탈까?</h2>
      <p>
        스프레드와 기준금리 사이클을 결합하면 실용적인 의사결정 프레임이 나옵니다.
      </p>

      <ComparisonTable
        headersJson='["환경","기준금리","스프레드","권장 액션"]'
        rowsJson='[["인하 사이클 + 좁은 스프레드","↓","좁음","고정금리 잠그기 유리"],["인하 사이클 + 넓은 스프레드","↓","넓음","변동금리 + 차환 대기"],["인상 사이클 + 좁은 스프레드","↑","좁음","고정금리 즉시 잠그기"],["인상 사이클 + 넓은 스프레드","↑","넓음","상환·차환 보류, 자금 보유"]]'
        highlightLastCol
      />

      <CalculatorCTA
        title="내 대출, 금리별로 얼마나 차이날까?"
        description="원금·기간·금리 변화를 입력하면 월 상환액과 총이자를 한 번에 비교합니다."
        href="/finance/loan-calculator"
        buttonText="주택대출 시뮬레이터"
      />

      <p>
        매달 발표되는 ECOS 데이터를 자동으로 갱신해 Tooly 데이터 포털에 반영하고
        있습니다. 본인이 받은 대출 약정과 비교해 보면 스프레드가 어디쯤 위치하는지
        한눈에 파악할 수 있습니다.
      </p>
    </>
  );
}
