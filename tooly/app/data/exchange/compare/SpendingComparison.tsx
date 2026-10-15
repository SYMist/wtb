"use client";

import { useState, type ReactNode } from "react";
import type { CurrencyMeta, Point } from "@/lib/data/exchange-compare";
import {
  calculateQuote,
  changeFeeMode,
  convertSpending,
  emptyQuote,
  formatSpendingWon,
  parseSpendingInput,
  type FeeMode,
  type QuoteInput,
} from "@/lib/data/exchange-spending";

const inputClass =
  "mt-1 min-h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 py-2 text-base text-text-primary disabled:bg-surface disabled:text-text-secondary";

function DecimalInput({
  id,
  label,
  value,
  onChange,
  allowZero = false,
  disabled = false,
  descriptionId,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowZero?: boolean;
  disabled?: boolean;
  descriptionId?: string;
}) {
  const invalid = !disabled && parseSpendingInput(value, allowZero) === null;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm text-text-secondary">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={`${id}-help${descriptionId ? ` ${descriptionId}` : ""}`}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      <p
        id={`${id}-help`}
        className={`mt-1 text-xs ${invalid && value !== "" ? "text-red-600" : "text-text-secondary"}`}
      >
        {disabled
          ? "포함 견적에는 추가하지 않습니다."
          : `${allowZero ? "0 이상" : "0보다 큰"}의 숫자를 입력하세요. 소수점 사용 가능, 쉼표 제외.`}
      </p>
    </div>
  );
}

function QuoteCondition({
  id,
  quote,
  setQuote,
  amount,
  meta,
}: {
  id: "a" | "b";
  quote: QuoteInput;
  setQuote: (quote: QuoteInput) => void;
  amount: number | null;
  meta: CurrencyMeta;
}) {
  const cost = amount === null ? null : calculateQuote(amount, quote, meta);
  const included = quote.feeMode === "included";
  return (
    <fieldset className="min-w-0 space-y-4 rounded-lg border border-border p-4">
      <legend className="px-1 font-semibold text-text-primary">
        조건 {id.toUpperCase()}
      </legend>
      <div>
        <label
          htmlFor={`quote-${id}-mode`}
          className="text-sm text-text-secondary"
        >
          수수료 처리
        </label>
        <select
          id={`quote-${id}-mode`}
          value={quote.feeMode}
          onChange={(event) =>
            setQuote(changeFeeMode(quote, event.target.value as FeeMode))
          }
          className={inputClass}
        >
          <option value="separate">수수료 별도</option>
          <option value="included">수수료 포함 최종견적</option>
        </select>
      </div>
      <DecimalInput
        id={`quote-${id}-rate`}
        label={`적용환율 (원 / ${meta.unit}${meta.unitName})`}
        value={quote.rate}
        onChange={(rate) => setQuote({ ...quote, rate })}
      />
      {included && (
        <p className="text-xs text-text-secondary">
          모든 수수료가 반영된 최종견적의 적용환율을 입력하세요. 추가 수수료는
          가산하지 않습니다.
        </p>
      )}
      <DecimalInput
        id={`quote-${id}-percent`}
        label="비율 수수료 (%)"
        value={quote.percentFee}
        onChange={(percentFee) => setQuote({ ...quote, percentFee })}
        allowZero
        disabled={included}
        descriptionId="fee-rate-help"
      />
      <DecimalInput
        id={`quote-${id}-fixed`}
        label="고정 수수료 (원)"
        value={quote.fixedFee}
        onChange={(fixedFee) => setQuote({ ...quote, fixedFee })}
        allowZero
        disabled={included}
      />
      <div
        className="border-t border-border pt-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {cost ? (
          <dl className="space-y-2 text-sm">
            {!included && (
              <>
                <div className="flex flex-wrap justify-between gap-x-2">
                  <dt>기본 환산액</dt>
                  <dd>{formatSpendingWon(cost.baseKrw)}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-x-2">
                  <dt>추가 수수료 합계</dt>
                  <dd>{formatSpendingWon(cost.feeKrw)}</dd>
                </div>
              </>
            )}
            <div className="flex flex-wrap justify-between gap-x-2 font-semibold text-text-primary">
              <dt>원화 총비용</dt>
              <dd id={`quote-${id}-total`} className="break-all">
                {formatSpendingWon(cost.totalKrw)}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-text-secondary">
            외화 금액·적용환율과 활성화된 수수료를 유효하게 입력하면 총비용을
            표시합니다. 너무 큰 계산값은 표시할 수 없습니다.
          </p>
        )}
      </div>
    </fieldset>
  );
}

/** Personal inputs stay in component memory, outside the existing tracked GET form. */
export default function SpendingComparison({
  meta,
  from,
  to,
  children,
}: {
  meta: CurrencyMeta;
  from: Point;
  to: Point;
  children: ReactNode;
}) {
  const [amountInput, setAmountInput] = useState(
    String(meta.defaultForeignAmount),
  );
  const [quoteA, setQuoteA] = useState(emptyQuote);
  const [quoteB, setQuoteB] = useState(emptyQuote);
  const amount = parseSpendingInput(amountInput);
  const thenKrw =
    amount === null ? null : convertSpending(amount, from.rate, meta.unit);
  const nowKrw =
    amount === null ? null : convertSpending(amount, to.rate, meta.unit);
  const costA = amount === null ? null : calculateQuote(amount, quoteA, meta);
  const costB = amount === null ? null : calculateQuote(amount, quoteB, meta);

  return (
    <>
      <section className="mb-8" aria-labelledby="comparison-result-title">
        <h2
          id="comparison-result-title"
          className="text-lg font-semibold text-text-primary"
        >
          내 금액으로 역사 비교: {from.date} → {to.date}
        </h2>
        <div className="my-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <DecimalInput
            id="foreign-amount"
            label={`비교할 외화 금액 (${meta.code.toUpperCase()} · ${meta.unitName})`}
            value={amountInput}
            onChange={setAmountInput}
          />
          <p className="mt-2 text-xs text-text-secondary">
            아래 역사 비교와 실제 견적 A/B에 같은 통화·금액을 적용합니다.
            통화·기간이 바뀌거나 새로고침하면 금액은 {meta.defaultForeignAmount}
            {meta.unitName}, 견적은 빈 값으로 초기화됩니다.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-border bg-background p-5">
            <h3 className="mb-2 text-base font-semibold text-text-primary">
              입력한 외화 금액의 원화 환산
            </h3>
            <div aria-live="polite" aria-atomic="true">
              {thenKrw !== null && nowKrw !== null ? (
                <dl className="space-y-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-x-2">
                    <dt>시작월 ({from.date})</dt>
                    <dd
                      id="history-from-total"
                      className="break-all font-semibold"
                    >
                      {formatSpendingWon(thenKrw)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-x-2">
                    <dt>종료월 ({to.date})</dt>
                    <dd
                      id="history-to-total"
                      className="break-all font-semibold text-primary"
                    >
                      {formatSpendingWon(nowKrw)}
                    </dd>
                  </div>
                  <div className="border-t border-border pt-2">
                    <dt>차액 (종료월 − 시작월)</dt>
                    <dd
                      id="history-difference"
                      className="mt-1 break-all font-semibold"
                    >
                      {formatSpendingWon(nowKrw - thenKrw, true)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-text-secondary">
                  유효한 외화 금액을 입력하면 환산액을 표시합니다. 너무 큰
                  계산값은 표시할 수 없습니다.
                </p>
              )}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">
              한국은행 ECOS {meta.quoteLabel} 원화 월평균 매매기준율을
              사용합니다. 실제 결제금액이 아니며, 스프레드·수수료는 포함하지
              않습니다. 양수 차액은 종료월 환산액이 더 크다는 뜻입니다.
            </p>
          </div>
          {children}
        </div>
      </section>

      <section
        className="mb-8 rounded-lg border border-border bg-background p-4 sm:p-6"
        aria-labelledby="quote-comparison-title"
      >
        <h2
          id="quote-comparison-title"
          className="text-lg font-semibold text-text-primary"
        >
          실제 견적 비교 · 조건 A/B
        </h2>
        <p
          id="quote-amount"
          className="mt-2 break-all text-sm font-semibold text-text-primary"
        >
          비교 금액:{" "}
          {amount === null
            ? "위에서 유효한 외화 금액을 입력하세요"
            : `${amount.toLocaleString("ko-KR", { maximumFractionDigits: 20 })}${meta.unitName} (${meta.code.toUpperCase()})`}
        </p>
        <p className="mt-2 text-sm text-text-secondary">
          직접 확인한 적용환율을 각각 입력하세요. 역사 월평균값은 견적에 자동
          입력하지 않습니다.
        </p>
        <p
          id="fee-rate-help"
          className="mt-2 text-xs leading-relaxed text-text-secondary"
        >
          비율 수수료는 기본 환산액에 적용하는 추가 비용률이며, 은행의 ‘환율
          우대율’과 다른 값입니다. 수수료 별도 총비용 = 외화 금액 × 적용환율 ÷
          고시 단위 × (1 + 비율 수수료/100) + 고정 원화 수수료. 고시 단위는{" "}
          {meta.unit}
          {meta.unitName}입니다.
        </p>
        <p className="mt-2 text-xs text-text-secondary">
          수수료 처리 모드를 바꾸면 비율·고정 수수료는 모두 0으로 초기화됩니다.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <QuoteCondition
            id="a"
            quote={quoteA}
            setQuote={setQuoteA}
            amount={amount}
            meta={meta}
          />
          <QuoteCondition
            id="b"
            quote={quoteB}
            setQuote={setQuoteB}
            amount={amount}
            meta={meta}
          />
        </div>
        <div
          className="mt-4 rounded-md bg-surface p-4"
          aria-live="polite"
          aria-atomic="true"
        >
          {costA && costB ? (
            <dl className="space-y-2 text-sm font-semibold text-text-primary">
              <div className="flex flex-wrap justify-between gap-x-2">
                <dt>조건 A 총비용</dt>
                <dd id="quote-summary-a" className="break-all">
                  {formatSpendingWon(costA.totalKrw)}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-2">
                <dt>조건 B 총비용</dt>
                <dd id="quote-summary-b" className="break-all">
                  {formatSpendingWon(costB.totalKrw)}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-x-2 border-t border-border pt-2">
                <dt>차액 (B − A)</dt>
                <dd id="quote-difference" className="break-all">
                  {formatSpendingWon(costB.totalKrw - costA.totalKrw, true)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-text-secondary">
              두 조건이 모두 유효하면 원화 총비용의 차액을 표시합니다.
            </p>
          )}
          <p className="mt-2 text-xs text-text-secondary">
            양수면 B의 총비용이 A보다 큽니다. 원화는 소수 둘째 자리까지 반올림해
            표시하고, 차액은 반올림 전 값으로 계산합니다. 실제 청구액은 결제사의
            처리 기준에 따라 달라질 수 있습니다.
          </p>
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          개인 금액·견적·수수료는 이 화면에서만 계산합니다. URL과 링크 공유에는
          통화·기간만 반영되며 개인 입력은 포함되지 않습니다. 미래 환율 예측이나
          환전 시점 추천은 제공하지 않습니다.
        </p>
      </section>
    </>
  );
}
