import { Metadata } from "next";
import BlogPost from "./blog-post";
import { BLOG_POSTS } from "../../../data/blog-posts";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find(post => post.slug === slug);
  
  if (!post) {
    return {
      title: "Post Not Found - Ilyas Akin",
    };
  }

  return {
    title: `${post.title} - Ilyas Akin`,
    description: post.preview,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(post => post.slug === slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
} 