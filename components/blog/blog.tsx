import styles from "./blog.module.scss";
import { BLOG_POSTS } from "../../data/blog-posts";
import Link from "next/link";

export default function Blog() {
  return (
    <section className={styles.blog}>
      <h2>Blog</h2>
      <div className={styles.posts}>
        {BLOG_POSTS.map((post) => (
          <Link 
            href={`/blog/${post.slug}`} 
            key={post.slug} 
            className={styles.postLink}
          >
            <article className={styles.post}>
              <h3>{post.title}</h3>
              <p>{post.preview}</p>
              <span className={styles.status}>{post.status}</span>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
} 