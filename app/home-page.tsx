import styles from "../styles/index.module.scss";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
import BackgroundController from "../components/background/background-controller";

export default function HomePage() {
  return (
    <>
      <BackgroundController />
      <div className={styles.container}>
        <Header />
        <div className={styles.page}>
          <Hero />
          {/* Blog section temporarily hidden */}
        </div>
      </div>
    </>
  );
}