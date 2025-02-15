"use client";
import { useState } from "react";
import { Mail } from "../icons";
import style from "./hero.module.scss";

const MM_TO_PX = 3.7795275591;

export default function MailButton() {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  return (
    <div className={style.hero__mail_container} title="Mail">
      <div className={style.tooltip}>
        <div className={style.tooltip__inner_container}>
          <div className={style.tooltip__text}>
            {isCopied ? "Copied!" : "Click to copy"}
          </div>
          {!isCopied && (
            <div className={style.tooltip__text}>me@ilyasakin.dev</div>
          )}
        </div>
        <div className={style.tooltip__arrow}></div>
      </div>
      <Mail
        className={style.hero__icon}
        height={10 * MM_TO_PX}
        width={10 * MM_TO_PX}
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigator.clipboard.writeText("me@ilyasakin.dev");
          setIsCopied(true);
        }}
        onMouseLeave={() => setTimeout(() => setIsCopied(false), 150)}
      />
      <span className={style.hero__link_text}>Mail</span>
    </div>
  );
}
