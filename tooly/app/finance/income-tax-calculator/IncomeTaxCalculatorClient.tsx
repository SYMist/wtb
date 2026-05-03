"use client";

import { useState, useMemo } from "react";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import AdSlot from "@/components/common/AdSlot";
import { calculateComprehensiveIncomeTax } from "@/lib/calculators/comprehensive-income-tax";
import { getCalculator } from "@/lib/data/calculators";

const fmt = (n: number) => Math.round(Math.abs(n)).toLocaleString("ko-KR");
const fmtWon = (n: number) => `${fmt(n)}원`;

function NumberInput({
  label,
  hint,
  value,
  onChange,
  unit = "원",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (raw: string) => void;
  unit?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-text-secondary mb-1.5">{hint}</p>}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-right text-sm text-text-primary focus:border-primary focus:outline-none"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
          {unit}
        </span>
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  sub,
  highlight,
  indent,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between py-2 text-sm ${
        highlight ? "font-bold" : ""
      } ${indent ? "pl-3 text-text-secondary" : "text-text-primary"}`}
    >
      <span>{label}</span>
      <span className="tabular-nums text-right">
        {value}
        {sub && <span className="ml-1 text-xs font-normal text-text-secondary">{sub}</span>}
      </span>
    </div>
  );
}

type IncomeType = "employee" | "freelancer";

export default function IncomeTaxCalculatorClient() {
  const calc = getCalculator("income-tax-calculator");

  // 유형 선택
  const [incomeType, setIncomeType] = useState<IncomeType>("employee");

  // 소득 입력
  const [laborRaw, setLaborRaw] = useState("40000000");
  const [businessRaw, setBusinessRaw] = useState("0");
  const [expenseRate, setExpenseRate] = useState(60);
  const [otherRaw, setOtherRaw] = useState("0");

  // 공제 입력
  const [dependents, setDependents] = useState(1);
  const [children, setChildren] = useState(0);
  const [pensionRaw, setPensionRaw] = useState("0");

  // 기납부세액
  const [prepaidRaw, setPrepaidRaw] = useState("0");

  const labor = Number(laborRaw) || 0;
  const business = Number(businessRaw) || 0;
  const other = Number(otherRaw) || 0;
  const prepaid = Number(prepaidRaw) || 0;

  // 근로소득자: 국민연금 자동 계산 (기준소득월액 상한 590만원 × 4.5% × 12개월)
  const autoPension = Math.round(Math.min(labor / 12, 5_900_000) * 0.045) * 12;
  const pension = incomeType === "employee" ? autoPension : (Number(pensionRaw) || 0);

  const handleTypeChange = (type: IncomeType) => {
    setIncomeType(type);
    if (type === "employee") {
      setBusinessRaw("0");
      setOtherRaw("0");
      setPrepaidRaw("0");
    } else {
      setLaborRaw("0");
      setPensionRaw("0");
      setPrepaidRaw("0");
    }
  };

  const result = useMemo(
    () =>
      calculateComprehensiveIncomeTax({
        laborIncome: labor,
        businessIncome: business,
        businessExpenseRate: expenseRate / 100,
        otherIncome: other,
        dependents,
        children,
        pensionPaid: pension,
        prepaidTax: prepaid,
      }),
    [labor, business, expenseRate, other, dependents, children, pension, prepaid]
  );

  const isRefund = result.payOrRefund < 0;
  const hasIncome = labor + business + other > 0;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "종합소득세 신고 대상자는 누구인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "근로소득 외 다른 소득(사업·이자·배당·임대·기타소득)이 있는 경우, 근로소득이 2곳 이상인 경우, 연말정산을 하지 않은 경우 등이 해당합니다. 매년 5월 1일~31일에 신고합니다.",
        },
      },
      {
        "@type": "Question",
        name: "프리랜서 3.3% 원천징수와 종합소득세 신고는 어떤 관계인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "프리랜서 소득에서 떼는 3.3%(소득세 3% + 지방소득세 0.3%)는 기납부세액입니다. 5월 종합소득세 신고 시 이를 차감해 최종 납부액 또는 환급액이 결정됩니다. 실제 세율이 3.3%보다 낮으면 환급을 받습니다.",
        },
      },
      {
        "@type": "Question",
        name: "기타소득 필요경비 60%는 어떤 의미인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "강연료·원고료 등 기타소득의 경우 수입금액의 60%를 필요경비로 인정합니다. 즉, 100만원을 받으면 소득금액은 40만원으로 과세됩니다. 단, 실제 경비가 60%를 초과하면 실제 경비를 신고할 수 있습니다.",
        },
      },
      {
        "@type": "Question",
        name: "종합소득세 계산 결과는 정확한 납부액인가요?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "본 계산기는 주요 공제 항목을 반영한 예상 세액으로, 실제 신고 시에는 의료비·교육비·기부금 공제, 세액감면 등 추가 항목에 따라 달라질 수 있습니다. 정확한 세액은 국세청 홈택스를 통해 확인하세요.",
        },
      },
    ],
  };

  return (
    <>
      <GNB />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary-light to-background px-4 py-10">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-medium text-primary mb-1">2026년 5월 신고</p>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              {calc?.seo.h1 ?? "종합소득세 계산기"}
            </h1>
            <p className="mt-2 text-text-secondary text-sm">
              근로·사업·기타소득 합산 → 납부 또는 환급 예상 세액 자동 계산
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

            {/* 왼쪽: 입력 */}
            <div className="space-y-6">
              <AdSlot type="banner" />

              {/* 유형 선택 토글 */}
              <div className="rounded-xl border border-border p-1 flex">
                {(["employee", "freelancer"] as IncomeType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                      incomeType === type
                        ? "bg-primary text-white shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {type === "employee" ? "근로소득자 (직장인)" : "자영업자 · 프리랜서"}
                  </button>
                ))}
              </div>

              {/* 소득 입력 */}
              <div className="rounded-xl border border-border p-6 space-y-5">
                <h2 className="text-base font-semibold text-text-primary">소득 입력</h2>

                {/* 근로소득자: 총급여 메인 */}
                {incomeType === "employee" && (
                  <NumberInput
                    label="총급여 (연봉)"
                    hint="회사에서 받은 연간 급여 합계. 식대 등 비과세 포함"
                    value={laborRaw ? Number(laborRaw).toLocaleString("ko-KR") : ""}
                    onChange={setLaborRaw}
                  />
                )}

                {/* 프리랜서: 사업소득 메인 */}
                {incomeType === "freelancer" && (
                  <div className="space-y-3">
                    <NumberInput
                      label="사업소득 수입금액"
                      hint="프리랜서·자영업 연간 총수입 (3.3% 원천징수 전 금액)"
                      value={businessRaw ? Number(businessRaw).toLocaleString("ko-KR") : ""}
                      onChange={setBusinessRaw}
                    />
                    {business > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          필요경비율 <span className="font-normal text-text-secondary">({expenseRate}%)</span>
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[30, 40, 50, 60, 70, 80].map((r) => (
                            <button
                              key={r}
                              onClick={() => setExpenseRate(r)}
                              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                expenseRate === r
                                  ? "border-primary bg-primary text-white"
                                  : "border-border text-text-secondary hover:border-primary"
                              }`}
                            >
                              {r}%
                            </button>
                          ))}
                        </div>
                        <p className="mt-1.5 text-xs text-text-secondary">
                          IT·디자인·강의 등 서비스업 60% / 음식점 70% / 소매·제조업 80% (단순경비율 기준)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 기타소득 — 공통 */}
                <NumberInput
                  label="기타소득 수입금액"
                  hint="강연료·원고료·상금 등 (필요경비 60% 자동 차감). 없으면 0"
                  value={otherRaw ? Number(otherRaw).toLocaleString("ko-KR") : ""}
                  onChange={setOtherRaw}
                />

                {/* 근로소득자: 부업 사업소득 추가 가능 */}
                {incomeType === "employee" && (
                  <div className="space-y-3">
                    <NumberInput
                      label="부업·사업소득 수입금액"
                      hint="직장 외 자영업·프리랜서 소득. 없으면 0"
                      value={businessRaw ? Number(businessRaw).toLocaleString("ko-KR") : ""}
                      onChange={setBusinessRaw}
                    />
                    {business > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                          필요경비율 <span className="font-normal text-text-secondary">({expenseRate}%)</span>
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {[30, 40, 50, 60, 70, 80].map((r) => (
                            <button
                              key={r}
                              onClick={() => setExpenseRate(r)}
                              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                expenseRate === r
                                  ? "border-primary bg-primary text-white"
                                  : "border-border text-text-secondary hover:border-primary"
                              }`}
                            >
                              {r}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 공제 입력 */}
              <div className="rounded-xl border border-border p-6 space-y-5">
                <h2 className="text-base font-semibold text-text-primary">공제 입력</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      인적공제 인원
                      <span className="ml-1 text-xs font-normal text-text-secondary">(본인 포함)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setDependents((v) => Math.max(v - 1, 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:border-primary"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-base font-semibold tabular-nums">
                        {dependents}
                      </span>
                      <button
                        onClick={() => setDependents((v) => Math.min(v + 1, 11))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:border-primary"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">1인당 150만원 공제</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1.5">
                      자녀세액공제 자녀
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setChildren((v) => Math.max(v - 1, 0))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:border-primary"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-base font-semibold tabular-nums">
                        {children}
                      </span>
                      <button
                        onClick={() => setChildren((v) => Math.min(v + 1, 7))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary hover:border-primary"
                      >
                        +
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-text-secondary">1인당 15만원 세액공제</p>
                  </div>
                </div>

                {/* 연금: 근로소득자는 자동계산 표시, 프리랜서는 직접 입력 */}
                {incomeType === "employee" ? (
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      국민연금 납입액
                      <span className="ml-2 rounded-full bg-surface px-2 py-0.5 text-xs text-text-secondary">자동 계산</span>
                    </label>
                    <p className="text-xs text-text-secondary mb-1.5">
                      총급여 기준 직장가입자 본인 부담분 (4.5%, 월 상한 590만원)
                    </p>
                    <div className="flex items-center rounded-lg border border-border bg-surface px-3 py-2.5">
                      <span className="flex-1 text-right text-sm tabular-nums text-text-secondary">
                        {autoPension.toLocaleString("ko-KR")}
                      </span>
                      <span className="ml-2 text-sm text-text-secondary">원</span>
                    </div>
                  </div>
                ) : (
                  <NumberInput
                    label="국민연금 납입액"
                    hint="지역가입자 연간 납입액. 없거나 모르면 0"
                    value={pensionRaw ? Number(pensionRaw).toLocaleString("ko-KR") : ""}
                    onChange={setPensionRaw}
                  />
                )}
              </div>

              {/* 기납부세액 */}
              <div className="rounded-xl border border-border p-6 space-y-4">
                <h2 className="text-base font-semibold text-text-primary">기납부세액</h2>
                {incomeType === "employee" ? (
                  <p className="text-sm text-text-secondary">
                    연말정산에서 이미 납부한 세액(원천징수 소득세 연간 합계)입니다. 근로소득 원천징수영수증의 '기납부세액' 항목을 확인하세요. 부업 소득이 없다면 0으로 두면 됩니다.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-text-secondary">
                      클라이언트가 원천징수한 세금 합계입니다. 3.3% 중 소득세분(3%)이 해당해요.
                    </p>
                    {business > 0 && (
                      <button
                        onClick={() => setPrepaidRaw(String(Math.round(business * 0.033)))}
                        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary-light px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <span>⚡</span>
                        수입금액 × 3.3% 자동 입력 ({Math.round(business * 0.033).toLocaleString("ko-KR")}원)
                      </button>
                    )}
                  </>
                )}
                <NumberInput
                  label="기납부세액 합계 (소득세 + 지방소득세)"
                  value={prepaidRaw ? Number(prepaidRaw).toLocaleString("ko-KR") : ""}
                  onChange={setPrepaidRaw}
                />
              </div>

              <AdSlot type="inline" />

              {/* 가이드 */}
              <div className="rounded-xl border border-border p-6 space-y-4 text-sm leading-relaxed text-text-secondary">
                <h2 className="text-base font-semibold text-text-primary">종합소득세 신고 기본 가이드</h2>
                <p>
                  종합소득세는 매년 5월 1일~31일에 신고·납부합니다. 근로소득만 있고 연말정산을 마친 직장인은
                  원칙적으로 신고 의무가 없지만, <strong className="text-text-primary">부업·프리랜서·임대소득</strong>이
                  있다면 반드시 신고해야 합니다.
                </p>
                <p>
                  <strong className="text-text-primary">프리랜서(3.3% 원천징수)</strong>는 연간 수입에서 3%를 소득세로
                  미리 납부한 상태입니다. 실제 세율이 3%보다 낮으면 환급, 높으면 추가 납부가 발생합니다.
                  소득이 낮을수록 환급 가능성이 높습니다.
                </p>
                <p>
                  <strong className="text-text-primary">필요경비</strong>는 소득을 얻기 위해 실제 사용한 비용입니다.
                  장부를 쓰지 않는 경우 국세청의 단순경비율(업종별 60~80%)을 적용할 수 있습니다.
                  장부를 기장하면 실제 비용을 더 인정받아 세금이 줄어들 수 있습니다.
                </p>
              </div>

              {/* FAQ JSON-LD */}
              <div className="rounded-xl border border-border divide-y divide-border">
                <div className="p-4">
                  <h2 className="text-base font-semibold text-text-primary">자주 묻는 질문</h2>
                </div>
                {faqJsonLd.mainEntity.map((item, i) => (
                  <details key={i} className="group p-4">
                    <summary className="cursor-pointer text-sm font-medium text-text-primary list-none flex justify-between items-center">
                      {item.name}
                      <span className="ml-2 text-text-secondary group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.acceptedAnswer.text}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            {/* 오른쪽: 결과 sticky */}
            <div className="lg:sticky lg:top-6 h-fit space-y-4">
              {/* 핵심 결과 */}
              <div
                className={`rounded-xl border-2 p-5 ${
                  !hasIncome
                    ? "border-border bg-surface"
                    : isRefund
                    ? "border-green-400 bg-green-50"
                    : "border-negative/40 bg-red-50"
                }`}
              >
                <p className="text-xs font-medium text-text-secondary mb-1">
                  {isRefund ? "예상 환급액" : "예상 추가 납부액"}
                </p>
                <p
                  className={`text-3xl font-bold tabular-nums ${
                    isRefund ? "text-green-600" : "text-negative"
                  }`}
                >
                  {hasIncome ? (isRefund ? "−" : "+") : "—"}
                  {hasIncome ? fmtWon(result.payOrRefund) : ""}
                </p>
                {hasIncome && (
                  <p className="mt-1 text-xs text-text-secondary">
                    {isRefund ? "기납부세액이 결정세액보다 많아 환급됩니다" : "결정세액이 기납부세액보다 많아 추가 납부가 필요합니다"}
                  </p>
                )}
              </div>

              {/* 세액 상세 */}
              <div className="rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-3">계산 내역</h3>
                <div className="divide-y divide-border/50">
                  <div className="pb-2">
                    <ResultRow label="종합소득금액" value={fmtWon(result.totalIncome)} />
                    {result.laborIncomeAmount > 0 && (
                      <ResultRow label="└ 근로소득금액" value={fmtWon(result.laborIncomeAmount)} indent />
                    )}
                    {result.businessIncomeAmount > 0 && (
                      <ResultRow label="└ 사업소득금액" value={fmtWon(result.businessIncomeAmount)} indent />
                    )}
                    {result.otherIncomeAmount > 0 && (
                      <ResultRow label="└ 기타소득금액" value={fmtWon(result.otherIncomeAmount)} indent />
                    )}
                  </div>
                  <div className="py-2">
                    <ResultRow label="소득공제 합계" value={`−${fmtWon(result.totalDeduction)}`} />
                    <ResultRow label="└ 인적공제" value={fmtWon(result.personalDeduction)} indent />
                    {result.pensionDeduction > 0 && (
                      <ResultRow label="└ 연금보험료공제" value={fmtWon(result.pensionDeduction)} indent />
                    )}
                  </div>
                  <div className="py-2">
                    <ResultRow label="과세표준" value={fmtWon(result.taxBase)} highlight />
                    <ResultRow label="산출세액" value={fmtWon(result.calculatedTax)} />
                    <ResultRow label="세액공제" value={`−${fmtWon(result.taxCredit)}`} />
                    <ResultRow label="결정세액 (소득세)" value={fmtWon(result.determinedTax)} highlight />
                    <ResultRow label="지방소득세 (10%)" value={fmtWon(result.localTax)} />
                    <ResultRow label="총세금" value={fmtWon(result.totalTax)} highlight />
                  </div>
                  <div className="pt-2">
                    <ResultRow label="기납부세액" value={`−${fmtWon(prepaid)}`} />
                    <ResultRow
                      label={isRefund ? "환급세액" : "추가납부세액"}
                      value={`${isRefund ? "−" : "+"}${fmtWon(result.payOrRefund)}`}
                      highlight
                    />
                  </div>
                </div>
              </div>

              <AdSlot type="sidebar" />

              {/* 참고 안내 */}
              <p className="text-xs text-text-secondary leading-relaxed">
                본 계산기는 주요 항목 기준 예상액으로 실제 신고액과 다를 수 있습니다. 의료비·교육비·기부금 등
                추가 공제는 반영되지 않습니다. 정확한 신고는 국세청 홈택스를 이용하세요.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
