import type { MetadataRoute } from "next";
import { calculators, categories } from "@/lib/data/calculators";
import { getAllPosts } from "@/lib/blog/posts";
import { blogCategories } from "@/lib/blog/categories";

const BASE_URL = "https://tooly.deluxo.co.kr";

// noindex 처리된 thin 페이지 — sitemap에서도 제외 (robots noindex와 일관)
// 범용 13 + 얕은 금융 7. 양도세(capital-gains-tax)·퇴직금(severance-calculator)은 색인 유지 → 제외 안 함.
// 아파트 퍼널 2개는 2026-08-21 게이트 만료로 제거(robots index,follow와 정합).
const NOINDEX_PATHS = new Set<string>([
  // 범용
  "/health/bmi-calculator",
  "/health/bmr-calculator",
  "/health/calorie-calculator",
  "/date/age-calculator",
  "/date/date-difference",
  "/date/dday-calculator",
  "/date/workday-calculator",
  "/life/gpa-calculator",
  "/life/percent-calculator",
  "/life/speed-converter",
  "/life/electricity-calculator",
  "/convert/area-converter",
  "/convert/currency-converter",
  // 얕은 금융 (추후 deepen 시 해제)
  "/finance/income-tax-calculator",
  "/finance/rent-conversion",
  "/finance/deposit-calculator",
  "/finance/loan-calculator",
  "/finance/salary-calculator",
  "/finance/compound-interest",
  "/finance/vat-calculator",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}${cat.path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const calculatorPages: MetadataRoute.Sitemap = calculators
    .filter((calc) => !NOINDEX_PATHS.has(calc.path))
    .map((calc) => ({
      url: `${BASE_URL}${calc.path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: calc.isKiller ? 0.9 : 0.7,
    }));

  // 특수 랜딩 페이지
  const specialPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/finance/salary-calculator/minimum-wage`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.9,
    },
  ];

  const dataPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/data/rates`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/data/rates/base`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/data/rates/mortgage`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/data/rates/deposit`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/data/exchange`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/data/exchange/usd-krw`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 시점 비교 — 페이지는 1개. 두 시점 조합은 같은 URL의 쿼리 파라미터이므로
    // 색인 대상은 통화당 캐노니컬 4개뿐이다(조합 URL 양산 금지).
    { url: `${BASE_URL}/data/exchange/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/data/exchange/compare?cur=jpy`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/data/exchange/compare?cur=cny`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/data/exchange/compare?cur=eur`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/data/exchange/jpy-krw`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/data/exchange/cny-krw`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/data/exchange/eur-krw`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/data/rates/treasury-10y`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogCategories.map((cat) => ({
      url: `${BASE_URL}/blog/category/${cat.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...getAllPosts().map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return [
    ...staticPages,
    ...categoryPages,
    ...calculatorPages,
    ...specialPages,
    ...dataPages,
    ...blogPages,
  ];
}
