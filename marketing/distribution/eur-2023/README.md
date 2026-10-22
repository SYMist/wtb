# 2023 EUR/KRW distribution card

Static, editable share assets for the existing Tooly result page. This package does not add a site feature or publish a post.

## Data and method

- Source: Tooly's checked-in series, sourced from Bank of Korea ECOS 731Y004 (KRW per EUR, monthly average rate).
- The 2023 headline is the arithmetic mean of the 12 monthly averages: 1,412.32 KRW/EUR. It is not a daily-observation-weighted annual average.
- High and low identify the highest and lowest monthly averages: April (1,446.41) and January (1,342.37).
- The chart's vertical axis starts at 1,300 KRW and is labeled on-card.
- Dataset metadata last updated: 2026-10-01. Values were compared with the live result page on 2026-10-22.

## Files

- `eur-krw-2023-card.png`: 1080 × 1500 share image.
- `eur-krw-2023-card.svg`: editable source for the image.
- `eur-krw-2023-monthly.csv` and `eur-krw-2023-monthly.md`: accessible values.
- `alt.txt`: suggested image alternative text.
- `post-copy.md`: short copy and separate standard/NBlog QA links.
- `SHA256SUMS.txt`: hashes of generated assets.

Regenerate from the repository root with `node marketing/distribution/eur-2023/generate-card.mjs`. This reads `tooly/lib/data/eurkrw-rate-series.json` and uses the repository's installed `sharp` package to render the PNG.

## Destination

Canonical result page: <https://tooly.deluxo.co.kr/data/exchange/eur-krw?year=2023>

The UTM-tagged variants are in `post-copy.md`. Remove or change their campaign values if a publisher needs its own attribution. No external post or outreach was made as part of preparing this package.
