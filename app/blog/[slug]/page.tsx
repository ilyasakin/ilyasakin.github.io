import { Metadata } from "next";
import BlogPost from "./blog-post";
import { getMediumPosts } from "../../../utils/medium";
import { notFound } from "next/navigation";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const posts = await getMediumPosts();
  const post = posts.find(post => encodeURIComponent(post.title) === params.slug);
  
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
  const posts = await getMediumPosts();
  const post = posts.find(post => encodeURIComponent(post.title) === params.slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
} 