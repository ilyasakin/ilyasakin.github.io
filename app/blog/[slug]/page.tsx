import { Metadata } from "next";
import BlogPost from "./blog-post";
import { getMediumPosts } from "../../../utils/medium";
import { notFound } from "next/navigation";
import { toKebabCase } from "../../../utils/string";
import PageTransition from "../../../components/transitions/page-transition";

// Force static generation
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

// Generate static paths at build time
export async function generateStaticParams() {
  const posts = await getMediumPosts();
  return posts.map((post) => ({
    slug: toKebabCase(post.title),
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }>} 
): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getMediumPosts();
  const post = posts.find(post => toKebabCase(post.title) === slug);
  
  if (!post) return {};

  return {
    title: post.title,
    description: post.preview,
    openGraph: {
      title: post.title,
      description: post.preview,
      type: 'article',
      publishedTime: post.pubDate,
      authors: ['İlyas Akın'],
    },
  };
}

export default async function Page(
  { params }: { params: Promise<{ slug: string }>} 
) {
  const { slug } = await params;
  const posts = await getMediumPosts();
  const post = posts.find(post => toKebabCase(post.title) === slug);
  
  if (!post) {
    notFound();
  }

  return (
    <PageTransition>
      <BlogPost post={post} />
    </PageTransition>
  );
} 