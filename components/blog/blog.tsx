import styles from "./blog.module.scss";
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'next-view-transitions';
import { toKebabCase } from '../../utils/string';
import { IBlogPost } from "../../types/blog";
import { blogService } from "../../services/blog-service";

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

export default async function Blog() {
  const allPosts: IBlogPost[] = (await blogService.getAllPosts()).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <section className={styles.blog}>
      <div className={styles.heading}>
        <span className={styles.headingMarker} aria-hidden="true">/</span>
        <h2>Blog</h2>
        <span className={styles.headingCount} aria-hidden="true">
          {String(allPosts.length).padStart(2, '0')}
        </span>
      </div>
      <ol className={styles.posts}>
        {allPosts.map((post, index) => (
          <li key={post.source === 'local' ? post.slug : post.link}>
            <Link
              href={post.source === 'local' ? `/blog/${post.slug}` : `/blog/${toKebabCase(post.title)}`}
              className={styles.postLink}
              prefetch={false}
            >
              <article className={styles.post}>
                <span className={styles.postIndex} aria-hidden="true">
                  {String(allPosts.length - index).padStart(2, '0')}
                </span>
                <div className={styles.postBody}>
                  <h3 style={{ viewTransitionName: `blog-title-${post.source === 'local' ? post.slug : toKebabCase(post.title)}` }}>{post.title}</h3>
                  <p>{post.preview}</p>
                  <div className={styles.meta}>
                    <time dateTime={post.pubDate}>
                      {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.source === 'local' ? 'Personal Blog' : 'medium.com'}</span>
                  </div>
                </div>
                <span className={styles.postArrow} aria-hidden="true">→</span>
              </article>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
} 