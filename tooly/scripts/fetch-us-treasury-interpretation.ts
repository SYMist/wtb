/**
 * Federal Reserve Board H.15/H.10 release XML에서 필요한 일별 관측값을 추린다.
 *
 * 실행: npx tsx scripts/fetch-us-treasury-interpretation.ts
 * H.15/H.10 원본 XML은 크므로 저장하지 않고, 공개된 Board 데이터만 필요한 두
 * 시계열로 축소한다. 그래프의 표시점 축약은 클라이언트에서 한다. Build Your Package
 * (2026-11 폐지 예정)는 사용하지 않는다.
 */

import { execFileSync } from "child_process";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

type Point = { date: string; value: number };

const OUTPUT_PATH = join(process.cwd(), "lib/data/us-treasury-interpretation.json");
const H15_URL = "https://www.federalreserve.gov/releases/h15/data/FRB_h15_xml.zip";
const H10_URL = "https://www.federalreserve.gov/releases/h10/data/FRB_h10_xml.zip";
const H15_SERIES = "RIFLGFCY10_N.B";
const H10_SERIES = "RXI_N.B.KO";

async function download(url: string, outputPath: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`Board XML 다운로드 실패: HTTP ${response.status}`);
  writeFileSync(outputPath, Buffer.from(await response.arrayBuffer()));
}

function unzipXml(zipPath: string, entryName: string): string {
  try {
    return execFileSync("unzip", ["-p", zipPath, entryName], {
      encoding: "utf-8",
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (error) {
    throw new Error(`Board XML 압축 해제 실패(${entryName}): ${String(error)}`);
  }
}

function preparedAt(xml: string): string {
  const match = xml.match(/<message:Prepared>([^<]+)<\/message:Prepared>/);
  if (!match) throw new Error("Board XML에 Prepared 시각이 없습니다.");
  return match[1];
}

function extractSeries(xml: string, seriesName: string): Point[] {
  const series = xml.match(
    new RegExp(`<kf:Series\\b(?=[^>]*SERIES_NAME="${seriesName}")[\\s\\S]*?<\\/kf:Series>`),
  )?.[0];
  if (!series) throw new Error(`Board XML에 ${seriesName} 계열이 없습니다.`);

  const points = Array.from(series.matchAll(/<frb:Obs\b([^>]*)\/>/g), ([, attributes]) => {
    const status = attributes.match(/\bOBS_STATUS="([^"]+)"/)?.[1];
    const rawValue = attributes.match(/\bOBS_VALUE="([^"]+)"/)?.[1];
    const date = attributes.match(/\bTIME_PERIOD="(\d{4}-\d{2}-\d{2})"/)?.[1];
    if (status !== "A" || !rawValue || !date) return null;
    const value = Number(rawValue);
    return Number.isFinite(value) ? { date, value } : null;
  }).filter((point): point is Point => point !== null);
  if (points.length === 0) throw new Error(`${seriesName}에 숫자 관측값이 없습니다.`);
  return points;
}

async function main() {
  const tempDir = mkdtempSync(join(tmpdir(), "tooly-board-"));
  try {
    const h15Zip = join(tempDir, "h15.zip");
    const h10Zip = join(tempDir, "h10.zip");
    await Promise.all([download(H15_URL, h15Zip), download(H10_URL, h10Zip)]);

    const h15Xml = unzipXml(h15Zip, "H15_data.xml");
    const h10Xml = unzipXml(h10Zip, "H10_data.xml");
    const treasury10y = extractSeries(h15Xml, H15_SERIES);
    const krwPerUsd = extractSeries(h10Xml, H10_SERIES);
    const output = {
      treasury10y,
      krwPerUsd,
      h15PreparedAt: preparedAt(h15Xml),
      h10PreparedAt: preparedAt(h10Xml),
      sourceCheckedAt: new Date().toISOString().slice(0, 10),
    };

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf-8");
    console.log(
      `Saved H.15 ${treasury10y.length} points (${treasury10y.at(0)?.date} ~ ${treasury10y.at(-1)?.date}) and H.10 ${krwPerUsd.length} points (${krwPerUsd.at(0)?.date} ~ ${krwPerUsd.at(-1)?.date})`,
    );
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
