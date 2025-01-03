import Parser from "rss-parser";
import { Window } from "happy-dom";

export interface MediumPost {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  thumbnail?: string;
  preview: string;
  isLocal: false;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

let cachedPosts: MediumPost[] | null = null;
const CACHE_DURATION = 86400000; // 24 hours in milliseconds
let lastFetchTime: number = 0;

export async function getMediumPosts(): Promise<MediumPost[]> {
  // Return cached posts if they exist and aren't expired
  if (cachedPosts && (Date.now() - lastFetchTime) < CACHE_DURATION) {
    return cachedPosts;
  }

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
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

      const parsedPosts = feed.items.map((item) => {
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
          link: item.link || "",
          pubDate: item.pubDate || "",
          content: originalInnerHTML,
          preview: textContent.slice(0, 200).trim() + "...",
          thumbnail: item["content:encoded"]?.match(
            /<img[^>]*src="([^"]*)"[^>]*>/,
          )?.[1],
          isLocal: false as const,
        };
      });

      // Cache the results
      cachedPosts = parsedPosts;
      lastFetchTime = Date.now();
      return parsedPosts;
    } catch (err) {
      lastError = err as Error;
      
      if (err instanceof Error && err.message.includes('429')) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.log(`Received 429, retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("Failed to fetch Medium feed:", err);
      throw err;
    }
  }

  if (lastError) {
    console.error(`Failed to fetch Medium feed after ${MAX_RETRIES} retries:`, lastError);
    throw lastError;
  }

  throw new Error("Unexpected error in getMediumPosts");
}
