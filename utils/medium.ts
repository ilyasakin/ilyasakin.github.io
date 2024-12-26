import Parser from "rss-parser";
import { JSDOM } from "jsdom";

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  thumbnail?: string;
  preview: string;
}

interface CacheEntry {
  posts: MediumPost[];
  timestamp: number;
}

let cache: CacheEntry | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function getMediumPosts(): Promise<MediumPost[]> {
  // Check if cache exists and is valid
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    console.log("Serving posts from cache");
    return cache.posts;
  }

  console.log("Fetching fresh posts from Medium");
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const parser = new Parser();
      const feed = await parser.parseURL(`https://medium.com/feed/@ilyasakin`);

      const posts = feed.items.map((item) => {
        const dom = new JSDOM(item["content:encoded"] || "");
        dom.window.document.querySelectorAll("img").forEach((img) => {
          if (img.src.includes("post.clientViewed")) {
            img.remove();
          }
        });
        const originalInnerHTML = dom.window.document.body.innerHTML;
        dom.window.document.body.querySelectorAll("figure").forEach((figure) => {
          figure.remove();
        });
        dom.window.document
          .querySelectorAll("h1, h2, h3, h4, h5, h6")
          .forEach((header) => {
            header.remove();
          });
        const textContent = dom.window.document.body.textContent || "";

        return {
          title: item.title || "",
          link: item.link || "",
          pubDate: item.pubDate || "",
          content: originalInnerHTML,
          preview: textContent.slice(0, 200).trim() + "...",
          thumbnail: item["content:encoded"]?.match(
            /<img[^>]*src="([^"]*)"[^>]*>/,
          )?.[1],
        };
      });

      // Update cache
      cache = {
        posts,
        timestamp: Date.now(),
      };

      return posts;
    } catch (err) {
      lastError = err as Error;
      
      // Check if the error is a 429
      if (err instanceof Error && err.message.includes('429')) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Received 429, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's not a 429 error, handle it as before
      console.error("Failed to fetch Medium feed:", err);
      if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
        console.log("Parser error; serving posts from existing cache");
        return cache.posts;
      }
      throw err;
    }
  }

  // If we've exhausted all retries
  if (lastError) {
    console.error(`Failed to fetch Medium feed after ${MAX_RETRIES} retries:`, lastError);
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log("All retries failed; serving posts from existing cache");
      return cache.posts;
    }
    throw lastError;
  }

  throw new Error("Unexpected error in getMediumPosts");
}

// Optional: Add method to manually clear cache if needed
export function clearMediumPostsCache(): void {
  cache = null;
  console.log("Medium posts cache cleared");
}
