import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import Link from "next/link";
import styles from "./header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.brand}
        aria-label="İlyas Akın — home"
      >
        <Image
          src={Logo}
          alt=""
          width={32}
          height={32}
          className={styles.logo}
          priority
        />
      </Link>
    </header>
  );
};

export default Header;
