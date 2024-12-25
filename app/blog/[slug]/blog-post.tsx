"use client";
import styles from "./blog-post.module.scss";
import { BlogPost as BlogPostType } from "../../../data/blog-posts";
import { FancyBackground } from "../../../assets/fancy-background";
import { useEffect } from "react";
import Link from "next/link";

interface Props {
  post: BlogPostType;
}

export default function BlogPost({ post }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fancyBackground = new FancyBackground();
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mediaQuery.matches) {
      fancyBackground.init();
    }

    return () => {
      fancyBackground.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.backLink}>
          ← Back to home
        </Link>
      </nav>
      
      <article className={styles.article}>
        <header>
          <h1>{post.title}</h1>
          <p className={styles.status}>{post.status}</p>
        </header>
        
        <div className={styles.content}>
          {post.status === "Coming soon" ? (
            <p>This article is currently being written. Check back soon!</p>
          ) : (
            post.content
          )}
        </div>
      </article>
    </div>
  );
} 