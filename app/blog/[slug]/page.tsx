import { Metadata ,} from "next";
import BlogPost from "./blog-post";
import { getMediumPosts } from "../../../utils/medium";
import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params:Promise< { slug: string }>} 
): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getMediumPosts();
  const post = posts.find(post => encodeURIComponent(post.title) === slug);
  
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

export default async function Page(
  { params }: { params:Promise< { slug: string }>} 
) {
  const { slug } = await params;
  const posts = await getMediumPosts();
  const post = posts.find(post => encodeURIComponent(post.title) === slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPost post={post} />;
} 