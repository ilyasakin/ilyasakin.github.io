import styles from "./blog-post.module.scss";
import { MediumPost } from "../../../utils/medium";
import { formatDistanceToNow } from 'date-fns';
import BackToTop from "../../../components/back-to-top/back-to-top";
import BackButton from "../../../components/back-button/back-button";

interface Props {
  post: MediumPost;
}

export default function BlogPost({ post }: Props) {
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
            <a 
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mediumLink}
              itemProp="url"
            >
              Read on Medium
            </a>
          </div>
        </header>
        <div 
          className={styles.content} 
          itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: post.content }} 
          suppressHydrationWarning 
        />
      </article>

      <BackToTop />
    </div>
  );
} 