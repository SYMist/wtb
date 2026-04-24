import type { ComponentType } from "react";

export interface TocItem {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface PostAuthor {
  name: string;
  role?: string;
  bio?: string;
  avatar?: string;
}

export interface PostMeta {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  date: string;
  thumbnail?: string;
  author: PostAuthor;
  tldr: string[];
  toc: TocItem[];
  faq?: FaqItem[];
  relatedSlugs?: string[];
  readingMinutes: number;
}

export interface Post extends PostMeta {
  Content: ComponentType;
}

import * as Irp from "@/content/blog/irp-tax-benefit-2026";
import * as Mortgage from "@/content/blog/mortgage-repayment-methods";

type PostModule = {
  meta: PostMeta;
  default: ComponentType;
};

const registry: Record<string, PostModule> = {
  "irp-tax-benefit-2026": Irp,
  "mortgage-repayment-methods": Mortgage,
};

function toPost(mod: PostModule): Post {
  return { ...mod.meta, Content: mod.default };
}

export function getAllPosts(): Post[] {
  return Object.values(registry)
    .map(toPost)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const mod = registry[slug];
  return mod ? toPost(mod) : null;
}

export function getPostsByCategory(categoryId: string): Post[] {
  return getAllPosts().filter((p) => p.category === categoryId);
}

export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const all = getAllPosts();
  const bySlug = new Map(all.map((p) => [p.slug, p]));

  if (post.relatedSlugs && post.relatedSlugs.length > 0) {
    const curated = post.relatedSlugs
      .map((s) => bySlug.get(s))
      .filter((p): p is Post => Boolean(p));
    if (curated.length >= limit) return curated.slice(0, limit);
    const fill = all.filter(
      (p) => p.slug !== post.slug && !curated.find((c) => c.slug === p.slug)
    );
    return [...curated, ...fill].slice(0, limit);
  }

  return all
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, limit);
}
