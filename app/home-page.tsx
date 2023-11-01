'use client'
import styles from "../styles/index.module.scss";
import Header from "../components/header/header";
import Hero from "../components/hero/hero";
// This is a Client Component. It receives data as props and
// has access to state and effects just like Page components
// in the `pages` directory.
export default function HomePage() {
  return (
 

  <div className={styles.container}>


    <Header />

    <div className={styles.page}>
      <Hero />
    </div>
  </div>
  )
}