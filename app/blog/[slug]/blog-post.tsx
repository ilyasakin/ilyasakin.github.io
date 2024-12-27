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
      <nav className={styles.nav}>
        <BackButton />
      </nav>
      
      <article className={styles.article}>
        <header>
          <h1>{post.title}</h1>
          <div className={styles.meta}>
            <time suppressHydrationWarning dateTime={post.pubDate}>
              {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
            </time>
            <span>·</span>
            <a 
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mediumLink}
            >
              Read on Medium
            </a>
          </div>
        </header>
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} suppressHydrationWarning />
      </article>

      <BackToTop />
    </div>
  );
} 