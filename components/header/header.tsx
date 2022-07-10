import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import styles from "./header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
      <Image src={Logo} alt="Logo" width={32} height={32} />
    </header>
  );
};

export default Header;
