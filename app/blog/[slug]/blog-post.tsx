import styles from "./blog-post.module.scss";
import { BlogPost as BlogPostType } from "../../../data/blog-posts";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import BackButton from "../../../components/back-button/back-button";

interface Props {
  post: BlogPostType;
}

export default function BlogPost({ post }: Props) {
  const isLocalPost = 'isLocal' in post && post.isLocal === true;

  return (
    <div className={styles.container}>
      <nav className={styles.nav} aria-label="Navigation">
        <BackButton />
      </nav>
      
      <article className={styles.article} itemScope itemType="http://schema.org/BlogPosting">
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
          <div 
            className={styles.content} 
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        )}
      </article>
    </div>
  );
} 