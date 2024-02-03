import Link from "next/link";
import Image from "next/image";
import style from "./hero.module.scss";
import { useState } from "react";
import { Resume, Dribbble, Medium, Github, Linkedin, Mail } from "../icons";

const Hero = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const tenMmToPx = 37.7952755906;

  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I’m İlyas Akın, a software developer.
      </h1>

      <p className={style.hero__subtitle}>Crafting Code at Kuika Software ✨</p>

      <div className={style.hero__links}>
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://github.com/ilyasakin"
          title="GitHub"
        >
          <Github
            className={style.hero__icon}
            height={tenMmToPx}
            width={tenMmToPx}
          />
          <span className={style.hero__link_text}>GitHub</span>
        </Link>
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://dribbble.com/ashnwor"
          title="Dribbble"
        >
          <Dribbble
            className={style.hero__icon}
            height={tenMmToPx}
            width={tenMmToPx}
          />
          <span className={style.hero__link_text}>Dribbble</span>
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
            height={tenMmToPx}
            width={tenMmToPx}
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
          href="https://ilyasakin.medium.com"
          title="Medium"
        >
          <Medium
            className={style.hero__icon}
            height={tenMmToPx}
            width={tenMmToPx}
          />
          <span className={style.hero__link_text}>Medium</span>
        </Link>
        <Link
          className={style.hero__link}
          target="_blank"
          href="https://www.linkedin.com/in/ilyasakin"
          title="Linkedin"
        >
          <Linkedin
            className={style.hero__icon}
            height={tenMmToPx}
            width={tenMmToPx}
          />
          <span className={style.hero__link_text}>Linkedin</span>
        </Link>
        <Link
          className={style.hero__link}
          target="_blank"
          href="/ilyas-akin.pdf"
          prefetch={false}
          title="Resume"
        >
          <Resume
            className={style.hero__icon}
            height={tenMmToPx}
            width={tenMmToPx}
          />
          <span className={style.hero__link_text}>Resume</span>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
