import Parser from "rss-parser";
import { Window } from "happy-dom";
import { IBlogPost, BlogPostProvider } from "../types/blog";
import { toKebabCase } from "../utils/string";

export class MediumProvider implements BlogPostProvider {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000;

  async getPosts(): Promise<IBlogPost[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch('https://medium.com/feed/@ilyasakin', {
          next: { revalidate: 86400 }, // Cache for 24 hours
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        const parser = new Parser();
        const feed = await parser.parseString(xmlText);

        return feed.items.map(this.transformPost);
      } catch (err) {
        lastError = err as Error;
        
        if (err instanceof Error && err.message.includes('429')) {
          const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.log(`Received 429, retrying in ${delay}ms (attempt ${attempt + 1}/${this.MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        console.error("Failed to fetch Medium feed:", err);
        throw err;
      }
    }

    throw lastError || new Error("Unexpected error in getMediumPosts");
  }

  async getPost(slug: string): Promise<IBlogPost | null> {
    const posts = await this.getPosts();
    return posts.find(post => toKebabCase(post.title) === slug) || null;
  }

  private transformPost(item: any): IBlogPost {
    const window = new Window();
    const document = window.document;
    document.body.innerHTML = item["content:encoded"] || "";

    // Remove tracking images
    document.querySelectorAll("img").forEach((img) => {
      if (img.src.includes("post.clientViewed")) {
        img.remove();
      }
    });

    const originalInnerHTML = document.body.innerHTML;

    // Remove figures and headers for preview text
    document.querySelectorAll("figure").forEach((figure) => {
      figure.remove();
    });
    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((header) => {
      header.remove();
    });
    const textContent = document.body.textContent || "";

    return {
      title: item.title || "",
      slug: toKebabCase(item.title || ""),
      link: item.link || "",
      pubDate: item.pubDate || "",
      content: originalInnerHTML,
      preview: textContent.slice(0, 200).trim() + "...",
      thumbnail: item["content:encoded"]?.match(
        /<img[^>]*src="([^"]*)"[^>]*>/,
      )?.[1],
      source: 'medium'
    };
  }
} 