/**
 * 환율 비교·환산 검산 (의존성 없음)
 * 실행: npx tsx lib/data/exchange-compare.test.ts
 *
 * 스펙의 "검산 3겹" 명시값을 그대로 박아둔다. 계산식이 조용히 바뀌면 여기서 터져야 한다.
 */

import assert from "assert";
import { readFileSync } from "fs";
import { join } from "path";

import {
  CURRENCIES,
  buildPresets,
  compareRates,
  defaultRange,
  josa,
  lowestOfYear,
  resolveMonth,
  shiftMonths,
  type Point,
  type SeriesData,
} from "./exchange-compare";

const tests: Array<[string, () => void]> = [];
function test(name: string, fn: () => void) {
  tests.push([name, fn]);
}

function load(file: string): SeriesData {
  return JSON.parse(
    readFileSync(join(__dirname, file), "utf-8"),
  ) as SeriesData;
}

const usd = load("usdkrw-rate-series.json");
const jpy = load("jpykrw-rate-series.json");
const eur = load("eurkrw-rate-series.json");
const cny = load("cnykrw-rate-series.json");

const at = (data: SeriesData, ym: string): Point => {
  const p = data.series.find((x) => x.date === ym);
  assert.ok(p, `${ym} 없음`);
  return p!;
};

const round2 = (v: number) => Math.round(v * 100) / 100;

// ─────────────────────────────────────────────────────────────
// ① 손계산 새 정답지 — USD 2016-08(1111.68) → 2026-07(1497.43)
// ─────────────────────────────────────────────────────────────

const USD_FROM = "2016-08";
const USD_TO = "2026-07";

test("① 기준 데이터가 스펙 명시값과 같다 (r1=1111.68 / r2=1497.43)", () => {
  assert.strictEqual(at(usd, USD_FROM).rate, 1111.68);
  assert.strictEqual(at(usd, USD_TO).rate, 1497.43);
});

test("① 변화폭 +385.75원 · 변화율 +34.70%", () => {
  const r = compareRates(at(usd, USD_FROM), at(usd, USD_TO), CURRENCIES.usd);
  assert.strictEqual(round2(r.diff), 385.75);
  assert.strictEqual(round2(r.changePercent), 34.7);
});

test("① 외화 고정: 100달러 = 그때 111,168원 / 지금 149,743원", () => {
  const r = compareRates(at(usd, USD_FROM), at(usd, USD_TO), CURRENCIES.usd, {
    foreignAmount: 100,
  });
  assert.strictEqual(round2(r.foreignFixed.thenKrw), 111168);
  assert.strictEqual(round2(r.foreignFixed.nowKrw), 149743);
});

test("① 원화 고정: 100만원 = 그때 899.54달러 / 지금 667.81달러 (차이 -231.73달러)", () => {
  const r = compareRates(at(usd, USD_FROM), at(usd, USD_TO), CURRENCIES.usd);
  assert.strictEqual(round2(r.krwFixed.thenForeign), 899.54);
  assert.strictEqual(round2(r.krwFixed.nowForeign), 667.81);
  assert.strictEqual(round2(r.krwFixed.diffForeign), -231.73);
});

// ─────────────────────────────────────────────────────────────
// ② 독립 경로 교차검증 — 같은 답이 두 경로에서 나와야 한다
// ─────────────────────────────────────────────────────────────

test("② 구매력 변화율 -25.76% — 나눗셈 경로와 비율 경로가 일치한다", () => {
  const from = at(usd, USD_FROM);
  const to = at(usd, USD_TO);
  const r = compareRates(from, to, CURRENCIES.usd);

  // 나눗셈 경로: 실제 외화 금액 차이 ÷ 그때 금액
  const byDivision =
    (r.krwFixed.diffForeign / r.krwFixed.thenForeign) * 100;
  // 비율 경로: (r1 / r2 - 1) × 100
  const byRatio = (from.rate / to.rate - 1) * 100;

  assert.strictEqual(round2(byDivision), -25.76);
  assert.strictEqual(round2(byRatio), -25.76);
  assert.strictEqual(round2(r.krwFixed.purchasingPowerPercent), -25.76);
});

test("② 🔴 구매력 변화율은 변화율의 부호 반전이 아니다 (+34.70% ↔ -25.76%)", () => {
  const r = compareRates(at(usd, USD_FROM), at(usd, USD_TO), CURRENCIES.usd);
  const flipped = -r.changePercent; // 자주 나오는 오답: -34.70%
  assert.strictEqual(round2(flipped), -34.7);
  assert.strictEqual(round2(r.krwFixed.purchasingPowerPercent), -25.76);
  assert.notStrictEqual(
    round2(r.krwFixed.purchasingPowerPercent),
    round2(flipped),
  );
});

// ─────────────────────────────────────────────────────────────
// ③ 분모·경계 재점검
// ─────────────────────────────────────────────────────────────

test("③ from == to → 변화 0원·0%·환산 동일", () => {
  const p = at(usd, USD_TO);
  const r = compareRates(p, p, CURRENCIES.usd);
  assert.strictEqual(r.diff, 0);
  assert.strictEqual(r.changePercent, 0);
  assert.strictEqual(r.krwFixed.purchasingPowerPercent, 0);
  assert.strictEqual(r.foreignFixed.thenKrw, r.foreignFixed.nowKrw);
  assert.strictEqual(r.krwFixed.thenForeign, r.krwFixed.nowForeign);
});

test("③ 🔴 JPY는 100엔당 표기 — 100엔 = 그때 1,097.61원 / 지금 921.46원", () => {
  const from = at(jpy, USD_FROM);
  const to = at(jpy, USD_TO);
  const r = compareRates(from, to, CURRENCIES.jpy, { foreignAmount: 100 });
  assert.strictEqual(CURRENCIES.jpy.unit, 100);
  assert.strictEqual(round2(r.foreignFixed.thenKrw), 1097.61);
  assert.strictEqual(round2(r.foreignFixed.nowKrw), 921.46);
});

test("③ 🔴 JPY를 USD와 같은 단위로 처리하면 100배 틀린다", () => {
  const from = at(jpy, USD_FROM);
  const to = at(jpy, USD_TO);
  const correct = compareRates(from, to, CURRENCIES.jpy, { foreignAmount: 100 });
  const wrong = compareRates(from, to, CURRENCIES.usd, { foreignAmount: 100 });
  assert.strictEqual(round2(wrong.foreignFixed.nowKrw / correct.foreignFixed.nowKrw), 100);
});

test("③ JPY는 USD와 부호가 반대 — 원/엔은 내렸고 원화 구매력은 올랐다", () => {
  const usdR = compareRates(at(usd, USD_FROM), at(usd, USD_TO), CURRENCIES.usd);
  const jpyR = compareRates(at(jpy, USD_FROM), at(jpy, USD_TO), CURRENCIES.jpy);
  assert.ok(usdR.changePercent > 0, "USD 변화율은 +");
  assert.ok(jpyR.changePercent < 0, "JPY 변화율은 -");
  assert.ok(usdR.krwFixed.purchasingPowerPercent < 0);
  assert.ok(jpyR.krwFixed.purchasingPowerPercent > 0);
});

test("③ JPY 원화 고정도 100엔 단위를 통과한다 (100만원 = 그때 91,107.04엔)", () => {
  const r = compareRates(at(jpy, USD_FROM), at(jpy, USD_TO), CURRENCIES.jpy);
  // 그때: 1,000,000 / 1097.61 × 100 = 91,107.04엔
  assert.strictEqual(round2(r.krwFixed.thenForeign), 91107.04);
  // 지금: 1,000,000 / 921.46 × 100 = 108,523.43엔
  assert.strictEqual(round2(r.krwFixed.nowForeign), 108523.43);
});

// ─────────────────────────────────────────────────────────────
// 클램프 — 통화별 하한이 다르다
// ─────────────────────────────────────────────────────────────

test("클램프: 통화별 시작월 (USD·JPY 1980-01 / EUR 1999-01 / CNY 2006-01)", () => {
  assert.strictEqual(usd.series[0].date, "1980-01");
  assert.strictEqual(jpy.series[0].date, "1980-01");
  assert.strictEqual(eur.series[0].date, "1999-01");
  assert.strictEqual(cny.series[0].date, "2006-01");
});

test("클램프: 범위 이전 요청은 하한월로 보정되고 보정 사실이 남는다", () => {
  const r = resolveMonth(cny.series, "1990-05", cny.latest.date);
  assert.strictEqual(r.point.date, "2006-01");
  assert.deepStrictEqual(r.adjustment, {
    kind: "clamped-min",
    requested: "1990-05",
  });
});

test("클램프: 최신월 이후 요청은 최신월로 보정된다", () => {
  const r = resolveMonth(usd.series, "2099-01", usd.latest.date);
  assert.strictEqual(r.point.date, usd.latest.date);
  assert.strictEqual(r.adjustment.kind, "clamped-max");
});

test("클램프: 구간 안 정상 요청은 보정 없음", () => {
  const r = resolveMonth(usd.series, USD_FROM, usd.latest.date);
  assert.strictEqual(r.point.date, USD_FROM);
  assert.deepStrictEqual(r.adjustment, { kind: "none" });
});

test("클램프: 형식이 틀리면 기본값으로 떨어진다", () => {
  const r = resolveMonth(usd.series, "2016/08", usd.latest.date);
  assert.strictEqual(r.point.date, usd.latest.date);
  assert.strictEqual(r.adjustment.kind, "invalid");
});

test("클램프: 결측월은 가장 가까운 이전 달로 보정된다", () => {
  const sparse: Point[] = [
    { date: "2020-01", rate: 1100 },
    { date: "2020-03", rate: 1200 },
  ];
  const r = resolveMonth(sparse, "2020-02", "2020-03");
  assert.strictEqual(r.point.date, "2020-01");
  assert.deepStrictEqual(r.adjustment, { kind: "nearest", requested: "2020-02" });
});

test("클램프: CNY 기본 구간(10년 전)은 데이터 안이라 보정 없이 잡힌다", () => {
  const range = defaultRange(cny);
  assert.strictEqual(range.to, cny.latest.date);
  const r = resolveMonth(cny.series, range.from, cny.latest.date);
  assert.strictEqual(r.adjustment.kind, "none");
});

test("클램프: EUR 프리셋(역대 최고월)도 시계열 안에 있다", () => {
  for (const preset of buildPresets(eur)) {
    const r = resolveMonth(eur.series, preset.fromYm, eur.latest.date);
    assert.strictEqual(
      r.adjustment.kind,
      "none",
      `${preset.id} 보정됨: ${JSON.stringify(r.adjustment)}`,
    );
  }
});

// ─────────────────────────────────────────────────────────────
// 파생 날짜 — 상수 하드코딩 금지
// ─────────────────────────────────────────────────────────────

test("shiftMonths: 연 경계를 넘어간다", () => {
  assert.strictEqual(shiftMonths("2026-07", -12), "2025-07");
  assert.strictEqual(shiftMonths("2026-07", -60), "2021-07");
  assert.strictEqual(shiftMonths("2026-07", -120), "2016-07");
  assert.strictEqual(shiftMonths("2026-01", -1), "2025-12");
  assert.strictEqual(shiftMonths("2026-12", 1), "2027-01");
});

test("프리셋 6개 — 날짜가 latest에서 파생된다", () => {
  const presets = buildPresets(usd);
  assert.strictEqual(presets.length, 6);
  const byId = Object.fromEntries(presets.map((p) => [p.id, p.fromYm]));
  assert.strictEqual(byId.yoy, shiftMonths(usd.latest.date, -12));
  assert.strictEqual(byId["5y"], shiftMonths(usd.latest.date, -60));
  assert.strictEqual(byId["10y"], shiftMonths(usd.latest.date, -120));
  assert.strictEqual(byId.gfc, "2009-03");
  assert.strictEqual(byId.peak, usd.stats.max.date);
});

test("코로나 저점은 통화별로 다른 달이다 (파생값)", () => {
  const usdLow = lowestOfYear(usd.series, "2020");
  const cnyLow = lowestOfYear(cny.series, "2020");
  assert.ok(usdLow && cnyLow);
  assert.ok(usdLow!.date.startsWith("2020-"));
  assert.ok(cnyLow!.date.startsWith("2020-"));
  for (const p of usd.series.filter((x) => x.date.startsWith("2020-"))) {
    assert.ok(usdLow!.rate <= p.rate);
  }
});

test("역순 입력(from > to)도 계산은 되고 라벨은 뒤바뀌지 않는다", () => {
  const r = compareRates(at(usd, USD_TO), at(usd, USD_FROM), CURRENCIES.usd);
  assert.strictEqual(r.from.date, USD_TO);
  assert.strictEqual(r.to.date, USD_FROM);
  assert.strictEqual(round2(r.diff), -385.75);
  assert.strictEqual(round2(r.changePercent), -25.76);
});

test("조사: 통화·금액에 따라 은/는·을/를·로/으로가 갈린다", () => {
  assert.strictEqual(josa("달러", "은는"), "는");
  assert.strictEqual(josa("엔", "은는"), "은");
  assert.strictEqual(josa("위안", "을를"), "을");
  assert.strictEqual(josa("유로", "을를"), "를");
  assert.strictEqual(josa("1,497.43원", "로"), "으로");
  assert.strictEqual(josa("2026년 7월", "로"), "로"); // ㄹ 받침
  assert.strictEqual(josa("100달러", "로"), "로");
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

console.log(
  failed === 0
    ? `\n${tests.length}개 통과`
    : `\n${failed}/${tests.length}개 실패`,
);
process.exit(failed === 0 ? 0 : 1);
