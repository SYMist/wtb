import { createBlogOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-image";
import { getAllPosts, getPostBySlug } from "@/lib/blog/posts";
import { getBlogCategory } from "@/lib/blog/categories";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Tooly Blog";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post)
    return createBlogOgImage("Tooly Blog", "포스트를 찾을 수 없습니다.", "Blog");

  const cat = getBlogCategory(post.category);
  return createBlogOgImage(post.title, post.excerpt, cat?.name ?? "Blog");
}
