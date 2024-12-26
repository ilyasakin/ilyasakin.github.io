import styles from "../styles/index.module.scss";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
import BackgroundController from "../components/background/background-controller";
import Blog from "../components/blog/blog";
import { Suspense } from "react";
import BackToTop from "../components/back-to-top/back-to-top";

export default function HomePage() {
  return (
    <>
      <BackgroundController />
      <div className={styles.container}>
        <Header />
        <div className={styles.page}>
          <Hero />
          <Suspense fallback={<div>Loading blog posts...</div>}>
            <Blog />
          </Suspense>
        </div>
      </div>
      <BackToTop />
    </>
  );
}