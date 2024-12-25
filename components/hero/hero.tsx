import Link from "next/link";
import { Medium, Github, Linkedin } from "../icons";
import MailButton from "./mail-button";
import style from "./hero.module.scss";

const MM_TO_PX = 3.7795275591;

export default function Hero() {
  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I'm İlyas Akın, a senior full-stack web developer.
      </h1>

      <p className={style.hero__subtitle}>Crafting code at Kuika Software ✨</p>

      <div className={style.hero__links}>
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://github.com/ilyasakin"
          title="GitHub"
        >
          <Github
            className={style.hero__icon}
            height={10 * MM_TO_PX}
            width={10 * MM_TO_PX}
          />
          <span className={style.hero__link_text}>GitHub</span>
        </Link>
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://ilyasakin.medium.com"
          title="Medium"
        >
          <Medium
            className={style.hero__icon}
            height={10 * MM_TO_PX}
            width={10 * MM_TO_PX}
          />
          <span className={style.hero__link_text}>Medium</span>
        </Link>
        <MailButton />
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://www.linkedin.com/in/ilyasakin"
          title="Linkedin"
        >
          <Linkedin
            className={style.hero__icon}
            height={10 * MM_TO_PX}
            width={10 * MM_TO_PX}
          />
          <span className={style.hero__link_text}>Linkedin</span>
        </Link>
      </div>
    </div>
  );
}