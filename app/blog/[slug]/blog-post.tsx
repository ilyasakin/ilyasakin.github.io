import styles from "./blog-post.module.scss";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import BackButton from "../../../components/back-button/back-button";
import parse, { HTMLReactParserOptions, DOMNode, Element } from "html-react-parser";
import Image from "next/image";
import { sanitize } from "isomorphic-dompurify";
import { getPlaiceholder } from "plaiceholder";
import { IBlogPost as BlogPostType } from "../../../types/blog";

interface Props {
  post: BlogPostType;
}

type ImageMeta = { base64: string; width: number; height: number };

async function getImageMeta(src: string): Promise<ImageMeta | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const {
      base64,
      metadata: { width, height },
    } = await getPlaiceholder(buffer, { size: 10 });
    return { base64, width, height };
  } catch {
    return null;
  }
}

// Extract image URLs from both HTML <img> and Markdown ![alt](url) syntax.
// Regex is enough for both — no JSDOM needed, faster build, more tolerant of malformed HTML.
function extractImageUrls(content: string): string[] {
  const urls = new Set<string>();
  for (const m of content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    urls.add(m[1]);
  }
  for (const m of content.matchAll(/!\[[^\]]*\]\(([^\s)]+)/g)) {
    urls.add(m[1]);
  }
  return Array.from(urls);
}

export default async function BlogPost({ post }: Props) {
  const isLocalPost = post.source === "local";

  const placeholders = new Map<string, ImageMeta>();
  await Promise.all(
    extractImageUrls(post.content).map(async (url) => {
      const meta = await getImageMeta(url);
      if (meta) placeholders.set(url, meta);
    }),
  );

  const renderImage = (
    src: string,
    alt: string,
    attribW?: string,
    attribH?: string,
    className?: string,
  ) => {
    const meta = placeholders.get(src);
    const w = parseInt(attribW || "", 10);
    const h = parseInt(attribH || "", 10);
    const width = Number.isFinite(w) && w > 0 ? w : meta?.width ?? 1200;
    const height = Number.isFinite(h) && h > 0 ? h : meta?.height ?? 800;

    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        placeholder={meta?.base64 ? "blur" : "empty"}
        blurDataURL={meta?.base64}
        sizes="(max-width: 800px) 100vw, 800px"
      />
    );
  };

  // NOTE: `instanceof Element` is unreliable here — html-react-parser re-exports
  // the class from `domhandler`, and ESM/CJS class duplication can break identity.
  // Duck-typing on `.type === 'tag'` is the recommended workaround.
  const isImg = (node: DOMNode): node is Element =>
    (node as Element).type === "tag" && (node as Element).name === "img";

  const parserOptions: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (isImg(domNode)) {
        const { src, alt = "", width, height } = domNode.attribs;
        if (!src) return undefined;
        return renderImage(src, alt, width, height, domNode.attribs.class);
      }
      return undefined;
    },
  };

  const sanitizedContent = sanitize(post.content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "figure",
      "figcaption",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "width", "height", "class"],
  });

  return (
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Navigation">
        <BackButton />
      </nav>

      <article
        className={styles.article}
        itemScope
        itemType="http://schema.org/BlogPosting"
      >
        <header>
          <h1
            itemProp="headline"
            style={{ viewTransitionName: `blog-title-${post.slug}` }}
          >
            {post.title}
          </h1>
          <div className={styles.meta}>
            <time
              itemProp="datePublished"
              suppressHydrationWarning
              dateTime={post.pubDate}
            >
              {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
            </time>
            <span aria-hidden="true">·</span>
            {post.source === "medium" && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mediumLink}
                itemProp="url"
              >
                Read on Medium
              </a>
            )}
          </div>
        </header>

        {isLocalPost ? (
          <div className={styles.content} itemProp="articleBody">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => {
                  if (!src || typeof src !== "string") return null;
                  return renderImage(src, alt || "");
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className={styles.content} itemProp="articleBody">
            {parse(sanitizedContent, parserOptions)}
          </div>
        )}
      </article>
    </div>
  );
}
