import Link from "next/link";
import Image from "next/image";
import style from "./hero.module.scss";
import GitHubIcon from "../../assets/icons/github.svg";
import DribbbleIcon from "../../assets/icons/dribbble.svg";
import MailIcon from "../../assets/icons/mail.svg";
import MediumIcon from "../../assets/icons/medium.svg";
import LinkedInIcon from "../../assets/icons/linkedin.svg";
import ResumeIcon from "../../assets/icons/resume.svg";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";

const Hero = () => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const tooltipContent = (
    <span
      style={{
        fontSize: "12px",
        lineHeight: "1.5",
      }}
    >
      {isCopied ? "Copied!" : "Copy to clipboard"}
    </span>
  );

  return (
    <div className={style.hero__container}>
      <h1 className={style.hero__title}>
        Hi, I’m İlyas Akın, a software developer.
      </h1>

      <p className={style.hero__subtitle}>
        Currently I’m working at Stepfront™ as Software Developer
      </p>

      <div className={style.hero__links}>
        <Link href="https://github.com/ilyasakin" passHref>
          <a target="_blank" rel="noreferrer noopener">
            <Image src={GitHubIcon} alt="GitHub" />
          </a>
        </Link>
        <Link href="https://dribbble.com/ashnwor" passHref>
          <a target="_blank" rel="noreferrer noopener">
            <Image src={DribbbleIcon} alt="Dribbble" />
          </a>
        </Link>
        <Tooltip content={tooltipContent}>
          <Image
            style={{ cursor: "pointer" }}
            src={MailIcon}
            alt="Mail"
            height={27}
            width={33}
            onClick={() => {
              navigator.clipboard.writeText("ilyas.akin@yahoo.com");
              setIsCopied(true);
            }}
            onMouseLeave={() => setTimeout(() => setIsCopied(false), 150)}
          />
        </Tooltip>
        <Link href="https://ilyasakin.medium.com" passHref>
          <a target="_blank" rel="noreferrer noopener">
            <Image src={MediumIcon} alt="Medium" />
          </a>
        </Link>
        <Link href="https://www.linkedin.com/in/ilyasakin" passHref>
          <a target="_blank" rel="noreferrer noopener">
            <Image src={LinkedInIcon} alt="LinkedIn" />
          </a>
        </Link>
        <Link href="/ilyas-akin.pdf" passHref>
          <a target="_blank" rel="noreferrer noopener">
            <Image src={ResumeIcon} alt="Resume" />
          </a>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
