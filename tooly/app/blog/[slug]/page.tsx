import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import GNB from "@/components/common/GNB";
import Footer from "@/components/common/Footer";
import TldrBox from "@/components/blog/TldrBox";
import TableOfContents from "@/components/blog/TableOfContents";
import FaqAccordion from "@/components/blog/FaqAccordion";
import AuthorCard from "@/components/blog/AuthorCard";
import RelatedPosts from "@/components/blog/RelatedPosts";
import ArticleBody from "@/components/blog/ArticleBody";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog/posts";
import { getBlogCategory } from "@/lib/blog/categories";

const BASE_URL = "https://tooly.deluxo.co.kr";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: post.date,
      authors: [post.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

export default async function BlogArticlePage({ params }: Params) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const cat = getBlogCategory(post.category);
  const related = getRelatedPosts(post, 3);
  const url = `${BASE_URL}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: post.author.name },
    publisher: {
      "@type": "Organization",
      name: "Tooly",
      url: BASE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: cat?.name,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "블로그", item: `${BASE_URL}/blog` },
      ...(cat
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: cat.name,
              item: `${BASE_URL}/blog/category/${cat.id}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: cat ? 4 : 3,
        name: post.title,
        item: url,
      },
    ],
  };

  const faqJsonLd = post.faq && post.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : null;

  return (
    <>
      <GNB />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="hover:text-indigo-600">홈</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-indigo-600">블로그</Link>
          {cat && (
            <>
              <span>›</span>
              <Link href={`/blog/category/${cat.id}`} className="hover:text-indigo-600">
                {cat.name}
              </Link>
            </>
          )}
        </nav>

        {/* Category + Title */}
        {cat && (
          <span className="mb-4 inline-block rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
            {cat.name}
          </span>
        )}
        <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-[32px]">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex items-center gap-4 border-b border-slate-100 pb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-600">
            {post.author.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-slate-900">{post.author.name}</div>
            <div className="flex items-center gap-2 text-[13px] text-slate-400">
              <span>{formatDate(post.date)}</span>
              <span>·</span>
              <span>{post.readingMinutes}분 읽기</span>
            </div>
          </div>
        </div>

        {/* Featured image */}
        {post.thumbnail && (
          <figure className="mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              className="aspect-[16/9] w-full rounded-xl object-cover"
            />
          </figure>
        )}

        {/* TL;DR */}
        <TldrBox items={post.tldr} />

        {/* TOC */}
        <TableOfContents items={post.toc} />

        {/* Article body */}
        <ArticleBody source={post.body} />

        {/* FAQ */}
        {post.faq && <FaqAccordion items={post.faq} />}

        {/* Author */}
        <AuthorCard author={post.author} />

        {/* Related */}
        <RelatedPosts posts={related} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
