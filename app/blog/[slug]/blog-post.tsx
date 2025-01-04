import styles from "./blog-post.module.scss";
import { BlogPost as BlogPostType } from "../../../data/blog-posts";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import BackButton from "../../../components/back-button/back-button";
import parse, { HTMLReactParserOptions, Element } from "html-react-parser";
import Image from "next/image";
import { sanitize } from "isomorphic-dompurify";
import { getPlaiceholder } from "plaiceholder";
import { JSDOM } from "jsdom";

interface Props {
  post: BlogPostType;
}

const getImage = async (src: string) => {
  const buffer = await fetch(src).then(async (res) =>
    Buffer.from(await res.arrayBuffer()),
  );

  const {
    metadata: { height, width },
    ...plaiceholder
  } = await getPlaiceholder(buffer, { size: 10 });

  return {
    ...plaiceholder,
    img: { src, height, width },
  };
};

export default async function BlogPost({ post }: Props) {
  const isLocalPost = "isLocal" in post && post.isLocal === true;

  // Extract all image URLs from the content using JSDOM
  const imageUrls = new Set<string>();

  if (isLocalPost) {
    const dom = new JSDOM(post.content);
    const images = dom.window.document.querySelectorAll("img");
    images.forEach((img) => {
      if (img.src) imageUrls.add(img.src);
    });
  }

  // Generate placeholders for all images
  const placeholders = new Map<string, string>();
  await Promise.all(
    Array.from(imageUrls).map(async (url) => {
      const { base64 } = await getImage(url);
      if (base64) placeholders.set(url, base64);
    }),
  );

  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element && domNode.name === "img") {
        const {
          src,
          alt = "",
          width = "800",
          height = "400",
        } = domNode.attribs;
        const blurDataURL = placeholders.get(src);

        return (
          <Image
            src={src}
            alt={alt}
            width={parseInt(width, 10)}
            height={parseInt(height, 10)}
            className={domNode.attribs.class}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
          />
        );
      }
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
          <h1 itemProp="headline">{post.title}</h1>
          <div className={styles.meta}>
            <time
              itemProp="datePublished"
              suppressHydrationWarning
              dateTime={post.pubDate}
            >
              {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
            </time>
            <span aria-hidden="true">·</span>
            {!post.isLocal && (
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
          <div className={styles.content}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        ) : (
          <div className={styles.content} itemProp="articleBody">
            {parse(sanitizedContent, options)}
          </div>
        )}
      </article>
    </div>
  );
}
