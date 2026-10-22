#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, "../../..");
const sourcePath = resolve(repo, "tooly/lib/data/eurkrw-rate-series.json");
const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const rows = source.series.filter(({ date }) => date.startsWith("2023-")).sort((a, b) => a.date.localeCompare(b.date));
const priorRows = source.series.filter(({ date }) => date.startsWith("2022-")).sort((a, b) => a.date.localeCompare(b.date));

if (rows.length !== 12 || priorRows.length !== 12) {
  throw new Error(`Expected 12 monthly observations for 2023 and 2022; got ${rows.length}/${priorRows.length}.`);
}

const mean = (items) => items.reduce((total, item) => total + item.rate, 0) / items.length;
const average = mean(rows);
const priorAverage = mean(priorRows);
const highest = rows.reduce((best, item) => item.rate > best.rate ? item : best, rows[0]);
const lowest = rows.reduce((best, item) => item.rate < best.rate ? item : best, rows[0]);
const delta = average - priorAverage;
const verifiedOn = "2026-10-22";
const money = (value) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const monthNumber = (date) => Number(date.slice(-2));
const xml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const width = 1080;
const height = 1500;
const plot = { left: 210, right: 970, top: 690, bottom: 930 };
const yMin = 1300;
const yMax = 1500;
const xAt = (index) => plot.left + (plot.right - plot.left) * index / (rows.length - 1);
const yAt = (value) => plot.bottom - (value - yMin) * (plot.bottom - plot.top) / (yMax - yMin);
const points = rows.map((row, index) => `${xAt(index).toFixed(1)},${yAt(row.rate).toFixed(1)}`).join(" ");
const grid = [1300, 1350, 1400, 1450, 1500].map((tick) => {
  const y = yAt(tick).toFixed(1);
  return `<line x1="${plot.left}" y1="${y}" x2="${plot.right}" y2="${y}" stroke="#E5E7EB" stroke-width="2"/><text x="186" y="${(Number(y) + 9).toFixed(1)}" text-anchor="end" class="axis">${money(tick)}</text>`;
}).join("\n");
const monthTicks = rows.map((row, index) => `<text x="${xAt(index).toFixed(1)}" y="974" text-anchor="middle" class="month">${monthNumber(row.date)}월</text>`).join("\n");
const circles = rows.map((row, index) => {
  const isExtreme = row.date === highest.date || row.date === lowest.date;
  return `<circle cx="${xAt(index).toFixed(1)}" cy="${yAt(row.rate).toFixed(1)}" r="${isExtreme ? 10 : 7}" fill="${row.date === highest.date ? "#1D4ED8" : row.date === lowest.date ? "#16A34A" : "#FFFFFF"}" stroke="${row.date === highest.date ? "#1D4ED8" : row.date === lowest.date ? "#16A34A" : "#2563EB"}" stroke-width="${isExtreme ? 5 : 4}"/>`;
}).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">2023년 유로 환율 월별 흐름</title>
  <desc id="desc">한국은행 ECOS 원/유로 월평균 매매기준율 12개월. 월평균의 산술평균은 ${money(average)}원, 최고는 ${highest.date.slice(-2)}월 ${money(highest.rate)}원, 최저는 ${lowest.date.slice(-2)}월 ${money(lowest.rate)}원입니다.</desc>
  <defs>
    <linearGradient id="lineArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#2563EB" stop-opacity="0.16"/><stop offset="100%" stop-color="#2563EB" stop-opacity="0.01"/></linearGradient>
    <style>
      text { font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; fill: #111827; }
      .muted { fill: #6B7280; }
      .axis { font-size: 26px; fill: #6B7280; font-variant-numeric: tabular-nums; }
      .month { font-size: 27px; fill: #374151; }
      .number { font-variant-numeric: tabular-nums; }
    </style>
  </defs>
  <rect width="1080" height="1500" fill="#F8FAFC"/>
  <rect x="72" y="70" width="360" height="48" rx="24" fill="#DBEAFE"/>
  <text x="94" y="102" font-size="22" font-weight="700" fill="#1D4ED8">TOOLY DATA NOTE · EUR/KRW</text>

  <text x="72" y="207" font-size="68" font-weight="750" letter-spacing="-2">2023년 유로 환율</text>
  <text x="72" y="264" font-size="34" class="muted">월별 흐름과 최고·최저 월평균</text>

  <rect x="72" y="306" width="936" height="184" rx="24" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
  <text x="112" y="355" font-size="25" font-weight="650" class="muted">12개월 월평균의 산술평균</text>
  <text x="112" y="435" font-size="74" font-weight="750" class="number">${money(average)}<tspan font-size="38" font-weight="650">원</tspan></text>
  <line x1="645" y1="340" x2="645" y2="456" stroke="#E5E7EB" stroke-width="2"/>
  <text x="688" y="366" font-size="24" class="muted">2022년 월평균 산술평균 대비</text>
  <text x="688" y="427" font-size="45" font-weight="750" fill="#1D4ED8" class="number">+${money(delta)}원</text>
  <text x="688" y="462" font-size="22" class="muted">같은 1~12월, 월평균끼리 비교</text>

  <rect x="72" y="520" width="936" height="504" rx="24" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
  <text x="112" y="580" font-size="36" font-weight="700">월별 흐름</text>
  <text x="112" y="620" font-size="25" class="muted">1유로당 원화 · 월평균 매매기준율</text>
  <text x="965" y="620" text-anchor="end" font-size="28" font-weight="600" fill="#B45309">세로축 1,300원부터</text>
  ${grid}
  <path d="M ${plot.left},${plot.bottom} L ${points.replaceAll(" ", " L ")} L ${plot.right},${plot.bottom} Z" fill="url(#lineArea)"/>
  <polyline points="${points}" fill="none" stroke="#2563EB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  ${circles}
  <line x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}" stroke="#9CA3AF" stroke-width="2"/>
  ${monthTicks}

  <rect x="72" y="1052" width="452" height="138" rx="22" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
  <rect x="548" y="1052" width="460" height="138" rx="22" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="2"/>
  <text x="108" y="1094" font-size="28" font-weight="650" class="muted">최고 월평균</text>
  <text x="108" y="1148" font-size="34" font-weight="700">${highest.date.slice(-2)}월 · <tspan class="number">${money(highest.rate)}원</tspan></text>
  <text x="108" y="1180" font-size="26" class="muted">2023년 최고 월평균</text>
  <text x="584" y="1094" font-size="28" font-weight="650" class="muted">최저 월평균</text>
  <text x="584" y="1148" font-size="34" font-weight="700">${lowest.date.slice(-2)}월 · <tspan class="number">${money(lowest.rate)}원</tspan></text>
  <text x="584" y="1180" font-size="26" class="muted">2023년 최저 월평균</text>

  <rect x="72" y="1210" width="936" height="74" rx="18" fill="#EFF6FF"/>
  <text x="108" y="1257" font-size="29" font-weight="600" fill="#1E3A8A">12개월 월평균의 산술평균 · 일별 가중 연평균이 아닙니다.</text>

  <line x1="72" y1="1313" x2="1008" y2="1313" stroke="#D1D5DB" stroke-width="2"/>
  <text x="72" y="1355" font-size="28" font-weight="650">출처: 한국은행 ECOS 731Y004</text>
  <text x="72" y="1392" font-size="28" class="muted">원/유로 월평균 자료 · 갱신 ${xml(source.updatedAt)}</text>
  <text x="72" y="1425" font-size="26" class="muted">원자료와 운영 화면 대조 ${verifiedOn}</text>
  <text x="72" y="1470" font-size="30" font-weight="700" fill="#1D4ED8">월별 결과 보기 → tooly.deluxo.co.kr</text>
</svg>`;

const csv = ["month,krw_per_eur_monthly_average", ...rows.map(({ date, rate }) => `${date},${rate.toFixed(2)}`)].join("\n") + "\n";
const markdownTable = [
  "# 2023년 원/유로 월평균",
  "",
  "단위: 1유로당 원화 · 한국은행 ECOS 월평균 매매기준율",
  "",
  "| 기준월 | 원/유로 월평균 |",
  "| --- | ---: |",
  ...rows.map(({ date, rate }) => `| ${date} | ${money(rate)}원 |`),
  "",
  `12개월 월평균 산술평균: **${money(average)}원**. 최고 월평균: **${highest.date} ${money(highest.rate)}원**. 최저 월평균: **${lowest.date} ${money(lowest.rate)}원**.`,
  `2022년 같은 기간의 월평균 산술평균 ${money(priorAverage)}원 대비 **+${money(delta)}원**.`,
  "",
  `출처: 한국은행 ECOS 731Y004 · 원/유로 월평균 자료. Tooly 자료 최근 갱신: ${source.updatedAt}. 운영 화면 대조: ${verifiedOn}.`,
].join("\n") + "\n";

const alt = `2023년 원/유로 환율 월별 흐름. 단위는 1유로당 원화, 한국은행 ECOS 월평균 매매기준율입니다. 12개월 월평균의 산술평균은 ${money(average)}원이며 2022년 12개월 월평균 산술평균보다 ${money(delta)}원 높습니다. 최고 월평균은 ${highest.date.slice(-2)}월 ${money(highest.rate)}원, 최저 월평균은 ${lowest.date.slice(-2)}월 ${money(lowest.rate)}원입니다. 그래프 세로축은 1,300원부터 시작해 변동을 확대해 보여줍니다. 자료 최근 갱신 ${source.updatedAt}, 운영 화면 대조 ${verifiedOn}. 2023년 상세 결과는 tooly.deluxo.co.kr에서 확인할 수 있습니다.`;
const basicUrl = "https://tooly.deluxo.co.kr/data/exchange/eur-krw?year=2023&utm_source=publisher&utm_medium=referral&utm_campaign=eur_year_card&utm_content=body";
const nblogUrl = "https://tooly.deluxo.co.kr/data/exchange/eur-krw?year=2023&utm_source=naver_blog&utm_medium=referral&utm_campaign=eur_year_card&utm_content=post_body";
const copy = `2023년 원/유로 월평균은 1유로당 ${money(average)}원이었습니다. 4월 월평균이 ${money(highest.rate)}원으로 가장 높았고, 1월 ${money(lowest.rate)}원으로 가장 낮았습니다. 이 평균은 12개월 월평균 값의 산술평균입니다.\n\n출처: 한국은행 ECOS 731Y004 · 원/유로 월평균 매매기준율. Tooly 자료 최근 갱신 ${source.updatedAt}.\n\n2023년 월별 결과: ${basicUrl}`;

const files = {
  "eur-krw-2023-card.svg": svg,
  "eur-krw-2023-monthly.csv": csv,
  "eur-krw-2023-monthly.md": markdownTable,
  "alt.txt": alt + "\n",
  "post-copy.md": ["## 짧은 소개", "", copy, "", "## 기본 외부 작성자 링크", "", basicUrl, "", "외부 배포 시 `utm_source=publisher`를 실제 배포처 식별자로 바꾸고 `utm_medium=referral`, `utm_campaign=eur_year_card`는 유지하세요.", "", "## Naver Blog QA 링크(기본 링크와 분리)", "", nblogUrl, ""].join("\n"),
};

for (const [name, contents] of Object.entries(files)) writeFileSync(resolve(here, name), contents, "utf8");

const requireFromTooly = createRequire(resolve(repo, "tooly/package.json"));
const sharp = requireFromTooly("sharp");
await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(resolve(here, "eur-krw-2023-card.png"));

const sumNames = [...Object.keys(files), "eur-krw-2023-card.png"];
const sums = sumNames.map((name) => {
  const bytes = readFileSync(resolve(here, name));
  return `${createHash("sha256").update(bytes).digest("hex")}  ${name}`;
}).join("\n") + "\n";
writeFileSync(resolve(here, "SHA256SUMS.txt"), sums, "utf8");
console.log(`Generated ${sumNames.length} assets from ${sourcePath}; ${rows.length} monthly observations; mean=${money(average)}; high=${highest.date}/${money(highest.rate)}; low=${lowest.date}/${money(lowest.rate)}.`);
