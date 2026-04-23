import type { MetadataRoute } from "next";
import { calculators, categories } from "@/lib/data/calculators";

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

  // 프로그래매틱 SEO 페이지
  const salaryAmounts = [2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500, 10000, 12000, 15000, 20000];
  const loanAmounts = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000];

  const programmaticPages: MetadataRoute.Sitemap = [
    ...salaryAmounts.map((amount) => ({
      url: `${BASE_URL}/finance/salary-calculator/${amount}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...loanAmounts.map((amount) => ({
      url: `${BASE_URL}/finance/loan-calculator/${amount}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
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
  ];

  return [
    ...staticPages,
    ...categoryPages,
    ...calculatorPages,
    ...programmaticPages,
    ...dataPages,
  ];
}
