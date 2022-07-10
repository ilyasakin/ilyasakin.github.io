import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
import styles from "../styles/index.module.scss";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Ilyas Akin</title>
        <meta name="description" content="Personal website of Ilyas Akin" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className={styles.page}>
        <Hero />
      </div>
    </div>
  );
};

export default Home;
