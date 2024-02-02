import Link from "next/link";
import Image from "next/image";
import style from "./hero.module.scss";
import { useState } from "react";
import { Resume, Dribbble, Medium, Github, Linkedin, Mail } from "../icons";

const Hero = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I’m İlyas Akın, a software developer.
      </h1>

      <p className={style.hero__subtitle}>Crafting Code at Kuika Software ✨</p>

      <div className={style.hero__links}>
        <Link href="https://github.com/ilyasakin" title="Github">
          <Github className={style.hero__icon} height={40} width={40} />
        </Link>
        <Link href="https://dribbble.com/ashnwor" title="Dribbble">
          <Dribbble className={style.hero__icon} height={40} width={40} />
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
            height={40}
            width={40}
            style={{ cursor: "pointer" }}
            onClick={() => {
              navigator.clipboard.writeText("ilyas.akin@yahoo.com");
              setIsCopied(true);
            }}
            onMouseLeave={() => setTimeout(() => setIsCopied(false), 150)}
          />
        </div>

        <Link href="https://ilyasakin.medium.com" title="Medium">
          <Medium className={style.hero__icon} height={40} width={40} />
        </Link>
        <Link href="https://www.linkedin.com/in/ilyasakin" title="Linkedin">
          <Linkedin className={style.hero__icon} height={40} width={40} />
        </Link>
        <Link href="/ilyas-akin.pdf" prefetch={false} title="Resume">
          <Resume className={style.hero__icon} height={40} width={40} />
        </Link>
      </div>
    </div>
  );
};

export default Hero;
