import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import styles from "./header.module.scss";

export interface IHeaderButtonProps {
  children?: React.ReactNode;
  active?: boolean;
}

const HeaderButton = (props: IHeaderButtonProps) => {
  const getClassName = (): string => {
    let className = styles.header_button;
    if (props.active) {
      className += ` ${styles.active}`;
    }
    return className;
  };

  return <button className={getClassName()}>{props.children}</button>;
};

const Header = () => {
  return (
    <header className={styles.header}>
      <Image src={Logo} alt="Logo" width={32} height={32} />
      <div className={styles.header_buttons}>
        <HeaderButton active>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="feather feather-home"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Home</span>
        </HeaderButton>
        <HeaderButton>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="feather feather-edit-3"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Blog</span>
        </HeaderButton>
      </div>
    </header>
  );
};

export default Header;
