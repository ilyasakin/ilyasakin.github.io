import styles from "./blog.module.scss";
import { getMediumPosts } from "../../utils/medium";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toKebabCase } from '../../utils/string';
import { LOCAL_BLOG_POSTS, BlogPost } from "../../data/blog-posts";

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours

export default async function Blog() {
  const mediumPosts = await getMediumPosts();
  const allPosts: BlogPost[] = [
    ...LOCAL_BLOG_POSTS,
    ...mediumPosts.map(post => ({ ...post, isLocal: false as const }))
  ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <section className={styles.blog}>
      <h2>Blog</h2>
      <div className={styles.posts}>
        {allPosts.map((post) => (
          <Link 
            href={post.isLocal ? `/blog/${post.slug}` : `/blog/${toKebabCase(post.title)}`}
            key={post.isLocal ? post.slug : post.link} 
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
                <span>{post.isLocal ? 'Personal Blog' : 'medium.com'}</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
} 