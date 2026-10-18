import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  assertNoOfficialHistoryLoss,
  parseBaseRateDecisionRows,
  type BaseRateDecisionSnapshot,
} from "../lib/data/base-rate-decisions";

const SOURCE_URL = "https://www.bok.or.kr/portal/singl/baseRate/list.do?menuNo=200677";
const OUTPUT_PATH = join(process.cwd(), "lib/data/base-rate-decisions.json");

async function main() {
  const response = await fetch(SOURCE_URL, {
    signal: AbortSignal.timeout(30_000),
    headers: { "user-agent": "Tooly public data refresh/1.0" },
  });
  if (!response.ok) throw new Error(`한국은행 변경 이력 HTTP ${response.status}`);
  const html = await response.text();
  if (!html.includes("2008년 2월 까지는 콜금리 목표")) {
    throw new Error("한국은행 페이지의 콜금리 목표/기준금리 구분 문구가 없습니다.");
  }
  const series = parseBaseRateDecisionRows(html);
  const checkedAt = new Date().toISOString().slice(0, 10);
  const snapshot: BaseRateDecisionSnapshot = {
    sourceUrl: SOURCE_URL,
    series,
    checkedAt,
    firstChangeDate: series[0].date,
    lastChangeDate: series[series.length - 1].date,
  };
  if (existsSync(OUTPUT_PATH)) {
    const previous = JSON.parse(readFileSync(OUTPUT_PATH, "utf8")) as BaseRateDecisionSnapshot;
    try {
      assertNoOfficialHistoryLoss(previous, snapshot);
    } catch (error) {
      throw new Error(`${error instanceof Error ? error.message : error} 기존 snapshot을 보존합니다.`);
    }
  }
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `Saved ${series.length} official changes (${snapshot.firstChangeDate} ~ ${snapshot.lastChangeDate}, checkedAt=${checkedAt}) to ${OUTPUT_PATH}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
