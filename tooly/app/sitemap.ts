import type { MetadataRoute } from "next";
import { calculators, categories } from "@/lib/data/calculators";
import { getAllPosts } from "@/lib/blog/posts";
import { blogCategories } from "@/lib/blog/categories";

const BASE_URL = "https://tooly.deluxo.co.kr";

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
      url: `${BASE_URL}/data`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
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
    // 화폐가치 환산은 이 페이지 내 섹션(쿼리 파라미터)이라 별도 URL을 만들지 않는다(조합 URL 양산 금지).
    { url: `${BASE_URL}/data/prices/cpi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
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
