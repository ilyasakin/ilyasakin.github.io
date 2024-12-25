"use client";
import styles from "../styles/index.module.scss";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
import Blog from "../components/blog/blog";
import { FancyBackground } from "../assets/fancy-background";
import { useEffect } from "react";
// This is a Client Component. It receives data as props and
// has access to state and effects just like Page components
// in the `pages` directory.
export default function HomePage() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Create a single instance of FancyBackground
    const fancyBackground = new FancyBackground();

    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        fancyBackground.destroy();
      } else {
        fancyBackground.init();
      }
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", onMediaChange);

    if (!mediaQuery.matches) {
      fancyBackground.init();
    }

    return () => {
      mediaQuery.removeEventListener("change", onMediaChange);
      fancyBackground.destroy();
    };
  }, []);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.page}>
        <Hero />
        <Blog />
      </div>
    </div>
  );
}