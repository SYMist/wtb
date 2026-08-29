import Link from "next/link";
import Callout from "@/components/blog/Callout";
import ComparisonTable from "@/components/blog/ComparisonTable";
import CalculatorCTA from "@/components/blog/CalculatorCTA";
import cpiIndexData from "@/lib/data/cpi-index-series.json";
import { compareMoneyValue, resolveMonth, shiftMonths } from "@/lib/data/cpi-compare";
import type { PostMeta } from "@/lib/blog/posts";

const fmtWon = (v: number) => `${Math.round(v).toLocaleString("ko-KR")}원`;

const indexLatest = cpiIndexData.latest;
const seriesStart = cpiIndexData.series[0].date;

const point1990 = resolveMonth(cpiIndexData.series, "1990-01", seriesStart).point;
const point2000 = resolveMonth(cpiIndexData.series, "2000-01", seriesStart).point;
const point10y = resolveMonth(
  cpiIndexData.series,
  shiftMonths(indexLatest.date, -120),
  seriesStart,
).point;

const result1990 = compareMoneyValue(point1990, indexLatest, 1_000_000);
const result2000 = compareMoneyValue(point2000, indexLatest, 1_000_000);
const result10y = compareMoneyValue(point10y, indexLatest, 1_000_000);

export const meta: PostMeta = {
  title: "1990년 100만원이 지금 얼마일까 — 소비자물가로 본 화폐가치",
  slug: "cpi-money-value-history",
  category: "data-analysis",
  excerpt: `1990년의 100만원은 지금 가치로 약 ${fmtWon(result1990.thenAmountNowValue)}. 한국은행 소비자물가지수 60년치 데이터로 시대별 돈의 가치가 어떻게 바뀌었는지 계산했습니다.`,
  date: "2026-08-29",
  author: {
    name: "Tooly 에디터",
    role: "데이터 에디터",
    bio: "공공 통계와 경제지표를 일상 의사결정으로 옮기는 Tooly Blog의 데이터 에디터.",
  },
  tldr: [
    `1990년 100만원은 지금 가치로 약 ${fmtWon(result1990.thenAmountNowValue)}입니다.`,
    `2000년 100만원은 약 ${fmtWon(result2000.thenAmountNowValue)}, 10년 전 100만원은 약 ${fmtWon(result10y.thenAmountNowValue)}로 계산됩니다.`,
    "화폐가치 환산은 소비자물가 원지수의 비율로 계산하며, 물가 상승률(전년동월비)과는 계산 목적이 다릅니다.",
    "2026년 12월 지수 기준연도 개편이 예정돼 있지만, 같은 기준 안에서 비교하는 한 환산 결과는 변하지 않습니다.",
  ],
  toc: [
    { id: "반비례", title: "물가와 화폐가치는 반비례한다", level: 2 },
    { id: "시대별-비교", title: "시대별 100만원, 지금 얼마?", level: 2 },
    { id: "왜-원지수", title: "왜 전년동월비가 아니라 원지수로 계산하나", level: 2 },
    { id: "실전", title: "내 상황에 대입해보기", level: 2 },
  ],
  faq: [
    {
      q: "화폐가치 환산은 어떻게 계산하나요?",
      a: "두 시점의 소비자물가 원지수 비율을 씁니다. 예를 들어 지금 지수가 그때보다 2배 높다면, 그때의 100만원은 지금 가치로 200만원입니다. 반대로 지금 100만원의 구매력을 그때 기준으로 환산하면 50만원이 됩니다.",
    },
    {
      q: "물가 상승률(전년동월비)과 화폐가치 환산은 같은 개념인가요?",
      a: "다릅니다. 전년동월비는 1년 사이의 변화 속도를 보여주는 지표이고, 화폐가치 환산은 임의의 두 시점 사이 누적 변화를 원지수 비율로 계산합니다. 여러 해에 걸친 누적 효과를 보려면 원지수 비율이, 최근 물가 흐름을 보려면 전년동월비가 적합합니다.",
    },
    {
      q: "지수 기준연도가 바뀌면 이 계산도 달라지나요?",
      a: "기준연도 개편(2026년 12월 예정)은 지수의 100 기준점을 새로 잡는 것으로, 같은 기준연도 안에서 두 시점을 비교하는 한 환산 비율에는 영향을 주지 않습니다. 다만 신·구 기준이 섞인 지수를 직접 비교하면 안 되므로, Tooly 데이터 포털은 개편 시 원지수를 전량 다시 적재해 기준을 맞춥니다.",
    },
  ],
  relatedSlugs: ["base-rate-mortgage-spread", "compound-interest-power"],
  readingMinutes: 4,
};

export default function Content() {
  return (
    <>
      <p>
        &ldquo;예전에 짜장면 한 그릇이 500원이었다&rdquo;는 말은 그리움이 아니라 데이터입니다.
        한국은행이 집계하는 소비자물가지수는 1965년부터 지금까지 매달 발표됐고, 이
        지수의 비율만 알면 어느 시점의 돈이 지금 가치로 얼마인지 정확히 계산할 수
        있습니다.
      </p>

      <h2 id="반비례">물가와 화폐가치는 반비례한다</h2>
      <p>
        물가가 오른다는 것은 같은 물건을 사는 데 더 많은 돈이 필요해진다는 뜻이고,
        뒤집으면 같은 돈으로 살 수 있는 것이 줄어든다는 뜻입니다. 소비자물가지수가
        두 배가 되면, 그 기간 벌어둔 현금의 실질 구매력은 절반이 됩니다.
      </p>

      <Callout type="info" title="계산 원리 — 지수 비율">
        (지금 지수 ÷ 그때 지수) × 그때 금액 = 지금 가치. 지수가 소비 구조 변화를
        반영해 개편되더라도, 같은 기준연도 안에서 두 시점을 비교하는 한 이 비율은
        그대로 유효합니다.
      </Callout>

      <h2 id="시대별-비교">시대별 100만원, 지금 얼마?</h2>
      <p>
        Tooly 데이터 포털의 소비자물가지수 원지수로 세 시점의 100만원을 지금
        ({indexLatest.date}) 가치로 환산하면 다음과 같습니다.
      </p>

      <ComparisonTable
        headersJson='["시점","그때 100만원","지금 가치","누적 상승률"]'
        rowsJson={`[["1990년","100만원","${fmtWon(result1990.thenAmountNowValue)}","${result1990.changePercent.toFixed(1)}%"],["2000년","100만원","${fmtWon(result2000.thenAmountNowValue)}","${result2000.changePercent.toFixed(1)}%"],["10년 전(${point10y.date})","100만원","${fmtWon(result10y.thenAmountNowValue)}","${result10y.changePercent.toFixed(1)}%"]]`}
        highlightLastCol
      />

      <p>
        기간이 길어질수록 누적 상승률의 차이가 크게 벌어집니다. 이는 물가 상승이
        복리처럼 누적되기 때문입니다 — 매년 몇 퍼센트씩만 올라도 30년이 쌓이면
        체감보다 훨씬 큰 격차가 생깁니다.
      </p>

      <h2 id="왜-원지수">왜 전년동월비가 아니라 원지수로 계산하나</h2>
      <p>
        Tooly의{" "}
        <Link href="/data/prices/cpi">소비자물가지수(CPI) 페이지</Link>는 물가
        흐름을 보여줄 때 전년동월비(1년 전 대비 변화율)를 기준으로 삼습니다. 반면
        화폐가치 환산은 임의의 두 시점 사이 누적 변화를 봐야 하므로, 원지수 자체의
        비율을 씁니다. 목적이 다르면 계산 방식도 달라야 정확합니다.
      </p>

      <Callout type="warning" title="기준연도 개편 예정 (2026년 12월)">
        소비자물가지수는 소비 구조 변화를 반영해 주기적으로 기준연도를 다시
        잡습니다. 개편 직후에는 신·구 지수를 직접 비교하면 안 되며, Tooly는 개편이
        반영되면 원지수를 전량 다시 적재해 기준을 통일합니다.
      </Callout>

      <h2 id="실전">내 상황에 대입해보기</h2>
      <p>
        내가 궁금한 시점과 금액을 직접 넣어 계산해볼 수 있습니다. 첫 월급, 전세
        보증금, 부모님 세대의 집값처럼 &ldquo;그때 그 돈&rdquo;이 지금 얼마인지
        확인해보세요.
      </p>

      <CalculatorCTA
        page={meta.slug}
        title="그때 그 돈, 지금 얼마일까?"
        description="시점과 금액을 입력하면 소비자물가지수 기준으로 지금 가치를 바로 계산합니다."
        href="/data/prices/cpi#money-value"
        buttonText="화폐가치 환산기 실행하기"
      />

      <p>
        소비자물가지수는 매달 한국은행 ECOS를 통해 갱신되며, Tooly 데이터
        포털에서 자동으로 반영됩니다.
      </p>
    </>
  );
}
