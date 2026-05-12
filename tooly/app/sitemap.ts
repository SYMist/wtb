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

  const calculatorPages: MetadataRoute.Sitemap = calculators.map((calc) => ({
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
