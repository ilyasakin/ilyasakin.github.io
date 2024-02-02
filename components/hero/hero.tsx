import Link from "next/link";
import Image from "next/image";
import style from "./hero.module.scss";
import GitHubIcon from "../../assets/icons/github.svg";
import DribbbleIcon from "../../assets/icons/dribbble.svg";
import MailIcon from "../../assets/icons/mail.svg";
import MediumIcon from "../../assets/icons/medium.svg";
import LinkedInIcon from "../../assets/icons/linkedin.svg";
import ResumeIcon from "../../assets/icons/resume.svg";
import { useState } from "react";

const Hero = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I’m İlyas Akın, a software developer.
      </h1>

      <p className={style.hero__subtitle}>
        Crafting Code at Kuika Software ✨
      </p>

      <div className={style.hero__links}>
        <Link href="https://github.com/ilyasakin">
          <Image className={style.hero__icon} src={GitHubIcon} alt="GitHub" />
        </Link>
        <Link href="https://dribbble.com/ashnwor">
          <Image
            className={style.hero__icon}
            src={DribbbleIcon}
            alt="Dribbble"
          />
        </Link>

        <div className={style.hero__mail_container}>
          <div className={style.tooltip}>
            <div className={style.tooltip__inner_container}>
              <div className={style.tooltip_text}>
                {isCopied ? "Copied!" : "Click to copy"}
              </div>
              {!isCopied && <div>ilyas.akin@yahoo.com </div>}
            </div>
            <div className={style.tooltip__filler}></div>
          </div>
          <Image
            className={style.hero__icon}
            src={MailIcon}
            alt="Mail"
            onClick={() => {
              navigator.clipboard.writeText("ilyas.akin@yahoo.com");
              setIsCopied(true);
            }}
            onMouseLeave={() => setTimeout(() => setIsCopied(false), 150)}
          />
        </div>

        <Link href="https://ilyasakin.medium.com">
          <Image className={style.hero__icon} src={MediumIcon} alt="Medium" />
        </Link>
        <Link href="https://www.linkedin.com/in/ilyasakin">
          <Image
            className={style.hero__icon}
            src={LinkedInIcon}
            alt="LinkedIn"
          />
        </Link>
        <Link href="/ilyas-akin.pdf" prefetch={false}>
          <Image className={style.hero__icon} src={ResumeIcon} alt="Resume" />
        </Link>
      </div>
    </div>
  );
};

export default Hero;
