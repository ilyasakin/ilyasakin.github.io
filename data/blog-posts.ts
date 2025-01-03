import { MediumPost } from "../utils/medium";

export interface LocalBlogPost {
  slug: string;
  title: string;
  preview: string;
  content: string;
  pubDate: string;
  isLocal: true;
}

export interface MediumBlogPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  thumbnail?: string;
  preview: string;
  isLocal: false;
}

export type BlogPost = LocalBlogPost | MediumBlogPost;

export const LOCAL_BLOG_POSTS: LocalBlogPost[] = [
  {
    slug: "exile-on-the-main-st",
    title: "Exile on the Main St",
    preview: "!Hola¡ from a new day in glorious hell called planet earth of ours...",
    pubDate: "2025-01-03T02:00:00Z",
    content: `
!Hola¡ from a new day in glorious hell called planet earth of ours.

Today marks a new arc in my life which includes me growing a pair and accepting my shortcomings and dealing with them with a collossal fucking hammer.

Even, a villain arc as some might say.

Life is too short for your, and, especially your bullshit for your own fucking sake.

Time to grow the fuck up.
`,
    isLocal: true
  }
]; 