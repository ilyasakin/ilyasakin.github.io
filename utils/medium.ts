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

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export async function getMediumPosts(): Promise<MediumPost[]> {
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

      return feed.items.map((item) => {
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
