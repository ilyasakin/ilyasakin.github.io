import { Metadata } from "next";
import BlogPost from "./blog-post";
import { notFound } from "next/navigation";
import { blogService } from "../../../services/blog-service";
import PageTransition from "../../../components/transitions/page-transition";

export async function generateStaticParams() {
  const posts = await blogService.getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }>} 
): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogService.getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.preview,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await blogService.getPost(slug);
  
  if (!post) {
    notFound();
  }

  return (
    <PageTransition>
      <BlogPost post={post} />
    </PageTransition>
  );
} 