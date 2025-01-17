import styles from "./blog.module.scss";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toKebabCase } from '../../utils/string';
import { IBlogPost } from "../../types/blog";
import { blogService } from "../../services/blog-service";

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

export default async function Blog() {
  const allPosts: IBlogPost[] = (await blogService.getAllPosts()).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <section className={styles.blog}>
      <h2>Blog</h2>
      <div className={styles.posts}>
        {allPosts.map((post) => (
          <Link 
            href={post.source === 'local' ? `/blog/${post.slug}` : `/blog/${toKebabCase(post.title)}`}
            key={post.source === 'local' ? post.slug : post.link} 
            className={styles.postLink}
            prefetch={false}
          >
            <article className={styles.post}>
              <h3>{post.title}</h3>
              <p>{post.preview}</p>
              <div className={styles.meta}>
                <time dateTime={post.pubDate}>
                  {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
                </time>
                <span>·</span>
                <span>{post.source === 'local' ? 'Personal Blog' : 'medium.com'}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
} 