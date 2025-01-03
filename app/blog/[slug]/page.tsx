import { Metadata } from "next";
import BlogPost from "./blog-post";
import { getMediumPosts } from "../../../utils/medium";
import { notFound } from "next/navigation";
import { toKebabCase } from "../../../utils/string";
import { LOCAL_BLOG_POSTS } from "../../../data/blog-posts";
import PageTransition from "../../../components/transitions/page-transition";

export async function generateStaticParams() {
  const mediumPosts = await getMediumPosts();
  return [
    ...LOCAL_BLOG_POSTS.map((post) => ({
      slug: post.slug,
    })),
    ...mediumPosts.map((post) => ({
      slug: toKebabCase(post.title),
    })),
  ];
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }>} 
): Promise<Metadata> {
  const { slug } = await params;
  const localPost = LOCAL_BLOG_POSTS.find(post => post.slug === slug);
  if (localPost) {
    return {
      title: localPost.title,
      description: localPost.preview,
    };
  }

  // Then check medium posts
  const mediumPosts = await getMediumPosts();
  const mediumPost = mediumPosts.find(post => toKebabCase(post.title) === slug);
  if (!mediumPost) return {};

  return {
    title: mediumPost.title,
    description: mediumPost.preview,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const localPost = LOCAL_BLOG_POSTS.find(post => post.slug === slug);
  if (localPost) {
    return (
      <PageTransition>
        <BlogPost post={{ ...localPost, isLocal: true }} />
      </PageTransition>
    );
  }

  // Then check medium posts
  const mediumPosts = await getMediumPosts();
  const mediumPost = mediumPosts.find(post => toKebabCase(post.title) === slug);
  
  if (!mediumPost) {
    notFound();
  }

  return (
    <PageTransition>
      <BlogPost post={{ ...mediumPost, isLocal: false }} />
    </PageTransition>
  );
} 