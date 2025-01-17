export interface IBlogPost {
  title: string;
  slug: string;
  link?: string;
  pubDate: string;
  content: string;
  preview: string;
  thumbnail?: string;
  source: 'medium' | 'local' | string;
}

export interface BlogPostProvider {
  getPosts(): Promise<IBlogPost[]>;
  getPost(slug: string): Promise<IBlogPost | null>;
} 