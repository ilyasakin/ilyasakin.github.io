import { IBlogPost, BlogPostProvider } from "../types/blog";
import { MediumProvider } from "../providers/medium-provider";
import { LocalProvider } from "../providers/local-provider";

export class BlogService {
  private providers: BlogPostProvider[];

  constructor() {
    this.providers = [
      new LocalProvider(),
      new MediumProvider(),
    ];
  }

  async getAllPosts(): Promise<IBlogPost[]> {
    const postsArrays = await Promise.all(
      this.providers.map(provider => provider.getPosts())
    );
    return postsArrays.flat();
  }

  async getPost(slug: string): Promise<IBlogPost | null> {
    for (const provider of this.providers) {
      const post = await provider.getPost(slug);
      if (post) return post;
    }
    return null;
  }
}

// Create singleton instance
export const blogService = new BlogService(); 