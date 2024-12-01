import Link from "next/link";
import { useState } from "react";
import { Medium, Github, Linkedin, Mail } from "../icons";
import style from "./hero.module.scss";

const Hero = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const MM_TO_PX = 3.7795275591;

  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I’m İlyas Akın, a senior full-stack web developer.
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
        <div className={style.hero__mail_container} title="Mail">
          <div className={style.tooltip}>
            <div className={style.tooltip__inner_container}>
              <div className={style.tooltip__text}>
                {isCopied ? "Copied!" : "Click to copy"}
              </div>
              {!isCopied && (
                <div className={style.tooltip__text}>ilyas.akin@yahoo.com </div>
              )}
            </div>
            <div className={style.tooltip__filler}></div>
          </div>
          <Mail
            className={style.hero__icon}
            height={10 * MM_TO_PX}
            width={10 * MM_TO_PX}
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigator.clipboard.writeText("ilyas.akin@yahoo.com");
              setIsCopied(true);
            }}
            onMouseLeave={() => setTimeout(() => setIsCopied(false), 150)}
          />
          <span className={style.hero__link_text}>Mail</span>
        </div>
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
};

export default Hero;