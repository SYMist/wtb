import type { Metadata } from "next";
import Link from "next/link";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import {
  computeCancelResult,
  MARGINAL_TAX_RATES,
  CURRENT_NOTICE,
  type CancelInput,
  type ProductType,
} from "@/lib/data/housing-subscription-cancel";
import CancelRunTracker from "./_components/CancelRunTracker";

const BASE_URL = "https://tooly.deluxo.co.kr";
const PATH = "/finance/housing-subscription-cancel";

type SearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_INPUT: CancelInput = {
  joinDate: "2024-01-01",
  cancelDate: "2026-01-01",
  monthlyAmount: 100_000,
  productType: "general",
  marginalTaxRate: 15,
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function firstParam(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

// 조합 URL 양산 금지 — canonical은 파라미터 없는 1개로 고정한다. 쿼리는 결과 화면만 바꾼다.
function parseInput(params: SearchParams): { input: CancelInput; hasQuery: boolean } {
  const join = firstParam(params.join);
  const cancel = firstParam(params.cancel);
  const amountRaw = firstParam(params.amount);
  const typeRaw = firstParam(params.type);
  const rateRaw = firstParam(params.rate);

  const joinDate = join && DATE_RE.test(join) ? join : DEFAULT_INPUT.joinDate;
  const cancelDate = cancel && DATE_RE.test(cancel) ? cancel : DEFAULT_INPUT.cancelDate;

  const amountNum = amountRaw ? Number(amountRaw) : NaN;
  const monthlyAmount =
    Number.isFinite(amountNum) && amountNum > 0 ? Math.round(amountNum) : DEFAULT_INPUT.monthlyAmount;

  const productType: ProductType = typeRaw === "youthDream" ? "youthDream" : "general";

  const rateNum = rateRaw ? Number(rateRaw) : NaN;
  const marginalTaxRate = (MARGINAL_TAX_RATES as readonly number[]).includes(rateNum)
    ? rateNum
    : DEFAULT_INPUT.marginalTaxRate;

  const hasQuery = Boolean(join || cancel || amountRaw || typeRaw || rateRaw);

  return {
    input: { joinDate, cancelDate, monthlyAmount, productType, marginalTaxRate },
    hasQuery,
  };
}

const fmtWon = (v: number) => `${v.toLocaleString("ko-KR")}원`;
const fmtSignedWon = (v: number) => `${v > 0 ? "+" : ""}${v.toLocaleString("ko-KR")}원`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  void (await searchParams);
  // canonical은 항상 파라미터 없는 1개 — 쿼리 조합별 URL을 색인시키지 않는다.
  const canonical = `${BASE_URL}${PATH}`;
  const r = computeCancelResult(DEFAULT_INPUT);
  const net = r.interest.afterTaxInterest - r.penaltyTax;

  return {
    title: "청약통장 해지 손익 계산기 — 이자·세금·추징 한 번에 | Tooly",
    description: `가입일·해지일·월 납입액을 넣으면 청약통장 중도해지 시 받을 이자, 이자소득세, 소득공제 추징세액을 한 번에 계산합니다. 예: 월 10만원 2년 납입 후 해지 시 세후이자 ${fmtWon(r.interest.afterTaxInterest)}, 추징 ${fmtWon(r.penaltyTax)}(${fmtSignedWon(net)}).`,
    alternates: { canonical },
    openGraph: {
      title: "청약통장 해지 손익 계산기",
      description: "이자는 얼마 받고 추징세는 얼마 낼까 — 가입일·해지일만 넣으면 바로 계산.",
      url: canonical,
      type: "article",
    },
  };
}

export default async function HousingSubscriptionCancelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { input, hasQuery } = parseInput(params);
  const r = computeCancelResult(input);
  const net = r.interest.afterTaxInterest - r.penaltyTax;

  const totalPaidRaw = r.interest.installments * input.monthlyAmount;
  const denominatorTrapActive = totalPaidRaw > 3_000_000 && r.deductionBasis < totalPaidRaw;
  const breakpointGoverning = r.reclaimedDeductionTax <= r.capReclaimTax;

  const faq = [
    {
      q: "청년주택드림청약통장은 2년 미만이어도 우대이율(3.7%/4.2%)이 적용되나요?",
      a: "아닙니다. 3.7%·4.2% 우대이율은 '청약 당첨으로 인한 해지'에만 적용되는 요건입니다. 이 계산기가 다루는 일반 중도해지(당첨 아닌 자진 해지)는 2년 미만 구간에서 일반 통장과 동일하게 2.3%·2.8%가 적용되고, 4.5%는 2년 이상부터만 붙습니다.",
    },
    {
      q: "추징세액 계산의 분모는 총 납입액인가요?",
      a: "아닙니다. 분모는 '연 300만원 한도로 캡된 누계'입니다. 월 50만원 이상 납입한 경우 실제 총 납입액보다 훨씬 작은 금액이 분모가 됩니다. 총 납입액을 그대로 곱하면 추징세액이 과대계상됩니다.",
    },
    {
      q: "추징세액은 항상 공제기준액의 6.6%인가요?",
      a: "6.6%는 상한일 뿐입니다. 공제율이 40%이므로 정확한 분기점은 한계세율 15%입니다. 한계세율이 15% 이하면 실제감면세액이 6.6%식보다 작아 실제감면세액이 그대로 추징됩니다. 15%를 넘으면 6.6% 상한이 걸립니다.",
    },
    {
      q: "가입 5년이 지나면 무조건 추징이 없나요?",
      a: "네. 소득공제 추징은 가입 후 5년 이내 해지 시에만 발생합니다. 5년을 채우고 해지하면 그동안 받은 소득공제를 추징당하지 않습니다.",
    },
    {
      q: "청약통장을 중도해지하면 이자소득세를 항상 내야 하나요?",
      a: "일반 청약종합저축은 이자소득세 15.4%가 항상 부과됩니다. 청년주택드림청약통장은 이자 500만원까지 비과세로 계산합니다. 실제로는 소득·무주택 등 별도 요건을 충족해야 하니, 상품 종류를 청년주택드림으로 선택하면 이 계산기가 비과세를 자동 반영합니다.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "금융", item: `${BASE_URL}/finance` },
      { "@type": "ListItem", position: 3, name: "청약통장 해지 손익 계산기", item: `${BASE_URL}${PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <CancelRunTracker
        joinDate={input.joinDate}
        cancelDate={input.cancelDate}
        monthlyAmount={input.monthlyAmount}
        productType={input.productType}
        source={hasQuery ? "query" : "default"}
      />

      <GNB />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <nav className="mb-4 text-xs text-text-secondary">
          <Link href="/" className="hover:text-primary">홈</Link>
          <span className="mx-1">/</span>
          <Link href="/finance" className="hover:text-primary">금융</Link>
          <span className="mx-1">/</span>
          <span className="text-text-primary">청약통장 해지 손익</span>
        </nav>

        <section className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-text-primary sm:text-3xl">
            청약통장 해지 손익 계산기
          </h1>
          <p className="mb-3 text-sm text-text-secondary">
            청약통장을 중도해지하면 이자는 받지만, 5년 이내라면 그동안 받은
            소득공제를 추징당할 수 있습니다. 가입일·해지일·월 납입액만 넣으면
            세후이자와 추징세액을 한 번에 계산해 실제로 남는 돈을 보여줍니다.
          </p>
          <p className="mb-6 text-sm text-text-secondary">
            이율 구간(1년미만·1~2년·2년이상)은{" "}
            <span className="font-medium text-text-primary">가입기간으로 단일 결정</span>
            되지만, 이율 값 자체는 고시 개정일마다 달라 회차별 경과월수 기준으로
            개정 전후 이율을 나눠 합산합니다({CURRENT_NOTICE.number}, 시행{" "}
            {CURRENT_NOTICE.effectiveFrom}).
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">1. 실수령액</p>
              <p className="mt-1 text-xl font-bold text-primary">
                {fmtWon(r.netAmount)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                원금 {fmtWon(r.interest.principal)} + 세후이자 {fmtWon(r.interest.afterTaxInterest)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">2. 세금·추징</p>
              <p className="mt-1 text-xl font-bold text-red-600">
                {fmtWon(r.totalTaxAndPenalty)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                이자소득세 {fmtWon(r.interest.interestTax)} + 추징세액{" "}
                {fmtWon(r.penaltyTax)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs text-text-secondary">3. 순손익</p>
              <p className={`mt-1 text-xl font-bold ${net >= 0 ? "text-green-600" : "text-red-600"}`}>
                {fmtSignedWon(net)}
              </p>
              <p className="mt-1 text-[11px] text-text-secondary">
                세후이자 {fmtWon(r.interest.afterTaxInterest)} - 추징세액 {fmtWon(r.penaltyTax)}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">직접 계산하기</h2>
          <form method="GET" action={PATH} className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-text-secondary">
              가입일
              <input
                type="date"
                name="join"
                defaultValue={input.joinDate}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-xs text-text-secondary">
              해지일
              <input
                type="date"
                name="cancel"
                defaultValue={input.cancelDate}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-xs text-text-secondary">
              월 납입액(원)
              <input
                type="number"
                name="amount"
                min={10_000}
                step={10_000}
                defaultValue={input.monthlyAmount}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              />
            </label>
            <label className="text-xs text-text-secondary">
              상품 종류
              <select
                name="type"
                defaultValue={input.productType}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              >
                <option value="general">일반 청약종합저축</option>
                <option value="youthDream">청년주택드림청약통장</option>
              </select>
            </label>
            <label className="text-xs text-text-secondary">
              한계세율
              <select
                name="rate"
                defaultValue={String(input.marginalTaxRate)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary"
              >
                {MARGINAL_TAX_RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}%
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="mt-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:col-span-3"
            >
              계산하기
            </button>
          </form>
        </section>

        <section className="mb-8 space-y-3 rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-text-secondary">
          <h2 className="text-base font-semibold text-text-primary">
            흔히 틀리는 두 가지
          </h2>
          <p>
            <span className="font-medium text-text-primary">① 추징 분모는 총 납입액이 아니다.</span>{" "}
            이번 계산에서 실제 총 납입액은 {fmtWon(totalPaidRaw)}이지만, 추징
            계산에 쓰인 공제기준액은 연 300만원 한도로 캡된{" "}
            {fmtWon(r.deductionBasis)}입니다.
            {denominatorTrapActive
              ? " 이 사례는 캡이 실제로 작동해 총 납입액보다 낮게 잡혔습니다."
              : " 이 사례는 연 납입액이 300만원을 넘지 않아 캡이 작동하지 않았습니다."}
          </p>
          <p>
            <span className="font-medium text-text-primary">② 6.6%는 상한이지 고정값이 아니다.</span>{" "}
            공제율 40%라 정확한 분기점은 한계세율 15%입니다. 이번 입력(한계세율{" "}
            {input.marginalTaxRate}%)에서는 실제감면세액 {fmtWon(r.reclaimedDeductionTax)}
            {breakpointGoverning
              ? `이 6.6%식 상한 ${fmtWon(r.capReclaimTax)}보다 작거나 같아 실제감면세액이 그대로 추징됩니다.`
              : `이 6.6%식 상한 ${fmtWon(r.capReclaimTax)}을 넘어 상한이 걸립니다.`}
          </p>
        </section>

        <div className="mb-8">
          <AdSlot type="inline" />
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">자주 묻는 질문</h2>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <details key={i} className="group rounded-lg border border-border bg-background p-4">
                <summary className="cursor-pointer text-sm font-medium text-text-primary">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-primary/30 bg-primary/5 p-5">
          <h2 className="mb-2 text-base font-semibold text-text-primary">함께 보면 좋은 계산기</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/finance/loan-calculator"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              주택대출 시뮬레이터
            </Link>
            <Link
              href="/finance/apartment-loan"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              아파트 대출 감당 시뮬레이터
            </Link>
            <Link
              href="/finance/deposit-calculator"
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface"
            >
              예적금 이자 계산기
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-lg border border-border bg-surface p-5 text-xs text-text-secondary">
          <h2 className="mb-2 text-sm font-semibold text-text-primary">데이터 출처 및 면책</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              이율 출처: {CURRENT_NOTICE.number}(시행 {CURRENT_NOTICE.effectiveFrom}).
              개정 이전 기간은 당시 시행 중이던 이율이 그대로 적용되며, 이율은
              향후 고시 개정으로 변경될 수 있습니다.
            </li>
            <li>
              청년주택드림청약통장 우대이율(3.7%·4.2%)은 청약 당첨 해지에만
              적용되며, 이 계산기는 일반 중도해지만 다룹니다.
            </li>
            <li>이자소득세 15.4%, 소득공제율 40%(연 300만원 한도), 5년 이내 해지 추징 6.6%(지방소득세 포함) 기준입니다.</li>
            <li>실제 세액은 개인 상황(연말정산 반영 여부, 은행별 처리)에 따라 달라질 수 있습니다. 참고용이며 정확한 금액은 가입 은행에 확인하세요.</li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
