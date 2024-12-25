import styles from "./blog.module.scss";
import { getMediumPosts } from "../../utils/medium";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toKebabCase } from '../../utils/string';

export default async function Blog() {
  const posts = await getMediumPosts();

  return (
    <section className={styles.blog}>
      <h2>Blog</h2>
      <div className={styles.posts}>
        {posts.map((post) => (
          <Link 
            href={`/blog/${toKebabCase(post.title)}`}
            key={post.link} 
            className={styles.postLink}
          >
            <article className={styles.post}>
              <h3>{post.title}</h3>
              <p>{post.preview}</p>
              <div className={styles.meta}>
                <time dateTime={post.pubDate}>
                  {formatDistanceToNow(new Date(post.pubDate), { addSuffix: true })}
                </time>
                <span>·</span>
                <span>medium.com</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
} 