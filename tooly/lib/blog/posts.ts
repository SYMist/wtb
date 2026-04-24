import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

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

export interface PostFrontmatter {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  date: string;
  thumbnail?: string;
  author: PostAuthor;
  tldr: string[];
  faq?: FaqItem[];
  relatedSlugs?: string[];
}

export interface Post extends PostFrontmatter {
  body: string;
  toc: TocItem[];
  readingMinutes: number;
}

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

function slugify(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractToc(body: string): TocItem[] {
  const lines = body.split("\n");
  const toc: TocItem[] = [];
  let inCodeBlock = false;

  for (const raw of lines) {
    const line = raw.trimStart();
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;

    const level = match[1].length === 2 ? 2 : 3;
    const title = match[2].replace(/[*_`]/g, "").trim();
    toc.push({ id: slugify(title), title, level });
  }

  return toc;
}

function readPostFile(filePath: string): Post {
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as PostFrontmatter;
  const stats = readingTime(content);

  return {
    ...frontmatter,
    body: content,
    toc: extractToc(content),
    readingMinutes: Math.max(1, Math.round(stats.minutes)),
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) return [];

  const files = fs
    .readdirSync(BLOG_CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) =>
    readPostFile(path.join(BLOG_CONTENT_DIR, file))
  );

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return readPostFile(filePath);
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
