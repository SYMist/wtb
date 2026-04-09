import type { MetadataRoute } from "next";
import { calculators, categories } from "@/lib/data/calculators";

const BASE_URL = "https://tooly.kr";

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

  return [...staticPages, ...categoryPages, ...calculatorPages];
}
