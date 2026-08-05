/**
 * 시계열 머지 가드 테스트 (의존성 없음)
 * 실행: npx tsx scripts/lib/series.test.ts
 */

import assert from "assert";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { mergeSeries, saveSeries, type Point, type Series } from "./series";

const tests: Array<[string, () => void]> = [];
function test(name: string, fn: () => void) {
  tests.push([name, fn]);
}

const p = (date: string, rate: number): Point => ({ date, rate });

// ⓐ 이전 파일에만 있는 월은 보존 — 2026-08-01 사고의 직접 재현
test("ⓐ ECOS가 아직 발행 안 한 최신 월을 보존한다", () => {
  const previous = [p("2026-05", 2.5), p("2026-06", 2.5), p("2026-07", 2.75)];
  const incoming = [p("2026-05", 2.5), p("2026-06", 2.5)]; // ECOS에 7월 없음
  const merged = mergeSeries(previous, incoming);
  assert.deepStrictEqual(merged, previous);
  assert.deepStrictEqual(merged[merged.length - 1], p("2026-07", 2.75));
});

test("ⓐ 과거 월도 사라지지 않는다 (수신 범위가 짧아도)", () => {
  const previous = [p("2000-01", 4.75), p("2020-05", 0.5), p("2026-06", 2.5)];
  const incoming = [p("2026-06", 2.5)];
  assert.deepStrictEqual(mergeSeries(previous, incoming), previous);
});

// ⓑ 판정선(틀림) 방어: 소스 정정이 반영되지 않으면 가드가 과한 것
test("ⓑ 같은 월이 양쪽에 있으면 ECOS 값이 이긴다 (정정 반영)", () => {
  const previous = [p("2026-06", 2.5), p("2026-07", 2.75)];
  const incoming = [p("2026-06", 2.5), p("2026-07", 3.0)]; // ECOS가 7월을 정정
  assert.deepStrictEqual(mergeSeries(previous, incoming), [
    p("2026-06", 2.5),
    p("2026-07", 3.0),
  ]);
});

test("ⓑ ECOS의 새 월은 그대로 추가된다", () => {
  const previous = [p("2026-06", 2.5), p("2026-07", 2.75)];
  const incoming = [p("2026-07", 2.75), p("2026-08", 2.75)];
  assert.deepStrictEqual(mergeSeries(previous, incoming), [
    p("2026-06", 2.5),
    p("2026-07", 2.75),
    p("2026-08", 2.75),
  ]);
});

test("이전 파일이 없으면 수신 시계열 그대로 (정렬만)", () => {
  const incoming = [p("2026-07", 2.75), p("2026-05", 2.5), p("2026-06", 2.5)];
  assert.deepStrictEqual(mergeSeries(null, incoming), [
    p("2026-05", 2.5),
    p("2026-06", 2.5),
    p("2026-07", 2.75),
  ]);
});

// --- saveSeries: 파일 단위 동작 ---

function withTempFile(previous: Series | null, fn: (path: string) => void) {
  const dir = mkdtempSync(join(tmpdir(), "series-test-"));
  const path = join(dir, "series.json");
  if (previous) {
    writeFileSync(path, JSON.stringify(previous, null, 2) + "\n", "utf-8");
  }
  fn(path);
}

function seriesFile(points: Point[], updatedAt: string): Series {
  return {
    series: points,
    latest: points[points.length - 1],
    stats: { max: points[0], min: points[0], average: 0 },
    updatedAt,
  };
}

test("saveSeries: 보존된 월이 파일에 남고 latest가 유지된다", () => {
  const previous = seriesFile(
    [p("2026-06", 2.5), p("2026-07", 2.75)],
    "2026-07-17",
  );
  withTempFile(previous, (path) => {
    saveSeries(path, [p("2026-06", 2.5)]);
    const out = JSON.parse(readFileSync(path, "utf-8")) as Series;
    assert.deepStrictEqual(out.series, previous.series);
    assert.deepStrictEqual(out.latest, p("2026-07", 2.75));
    // 데이터가 안 바뀌었으므로 updatedAt 보존 (불필요한 커밋 방지)
    assert.strictEqual(out.updatedAt, "2026-07-17");
  });
});

test("saveSeries: 데이터가 안 바뀌어도 checkedAt은 오늘로 갱신된다", () => {
  const previous = { ...seriesFile([p("2026-07", 2.75)], "2026-07-17"), checkedAt: "2026-07-17" };
  withTempFile(previous, (path) => {
    saveSeries(path, [p("2026-07", 2.75)]);
    const out = JSON.parse(readFileSync(path, "utf-8")) as Series;
    const today = new Date().toISOString().split("T")[0];
    assert.strictEqual(out.updatedAt, "2026-07-17"); // 값 불변 = 변경일 보존
    assert.strictEqual(out.checkedAt, today); // 확인일은 매 run 갱신
  });
});

test("saveSeries: stats는 머지 결과 전체로 재계산된다", () => {
  const previous = seriesFile([p("2026-06", 1.0), p("2026-07", 3.0)], "2026-07-17");
  withTempFile(previous, (path) => {
    saveSeries(path, [p("2026-06", 1.0)]);
    const out = JSON.parse(readFileSync(path, "utf-8")) as Series;
    assert.deepStrictEqual(out.stats.max, p("2026-07", 3.0));
    assert.deepStrictEqual(out.stats.min, p("2026-06", 1.0));
    assert.strictEqual(out.stats.average, 2);
  });
});

test("saveSeries: 값이 바뀌면 updatedAt이 갱신된다", () => {
  const previous = seriesFile([p("2026-06", 2.5)], "2020-01-01");
  withTempFile(previous, (path) => {
    saveSeries(path, [p("2026-06", 2.5), p("2026-07", 2.75)]);
    const out = JSON.parse(readFileSync(path, "utf-8")) as Series;
    assert.notStrictEqual(out.updatedAt, "2020-01-01");
  });
});

// ⓒ latest 역행 — 머지가 정상이면 도달 불가지만, 파일 손상/버그 대비 방어선
test("ⓒ latest가 뒤로 가면 저장하지 않고 throw", () => {
  const previous = seriesFile([p("2026-06", 2.5), p("2026-07", 2.75)], "2026-07-17");
  withTempFile(previous, (path) => {
    // 이전 파일의 series를 비워 머지가 보존할 게 없는 손상 상태를 만든다
    writeFileSync(
      path,
      JSON.stringify({ ...previous, series: [] }, null, 2),
      "utf-8",
    );
    const before = readFileSync(path, "utf-8");
    assert.throws(
      () => saveSeries(path, [p("2026-05", 2.5)]),
      /latest 역행 감지/,
    );
    assert.strictEqual(readFileSync(path, "utf-8"), before);
  });
});

test("saveSeries: 빈 시계열은 저장하지 않고 throw", () => {
  const previous = seriesFile([p("2026-07", 2.75)], "2026-07-17");
  withTempFile(previous, (path) => {
    const before = readFileSync(path, "utf-8");
    assert.throws(() => saveSeries(path, []), /빈 시계열/);
    assert.strictEqual(readFileSync(path, "utf-8"), before);
  });
});

let failed = 0;
for (const [name, fn] of tests) {
  try {
    fn();
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL  ${name}`);
    console.error(e);
  }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
if (failed > 0) process.exit(1);
