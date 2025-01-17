import { IBlogPost, BlogPostProvider } from "../types/blog";
import { LOCAL_BLOG_POSTS } from "../data/blog-posts";

export class LocalProvider implements BlogPostProvider {
  async getPosts(): Promise<IBlogPost[]> {
    return LOCAL_BLOG_POSTS.map(post => ({
      ...post,
      source: 'local'
    }));
  }

  async getPost(slug: string): Promise<IBlogPost | null> {
    const post = LOCAL_BLOG_POSTS.find(post => post.slug === slug);
    return post ? { ...post, source: 'local' } : null;
  }
} 