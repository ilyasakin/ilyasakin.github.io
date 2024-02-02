import { Metadata } from "next";
import "../styles/globals.css";
import { JetBrains_Mono } from "next/font/google";
import React from "react";

export const metadata: Metadata = {
  title: "Ilyas Akin",
  description: "My social links and resume.",
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto"],
  weight: "700",
  style: "normal",
});

interface IRootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout(props: IRootLayoutProps) {
  return (
    <html
      lang="en"
      className={jetbrainsMono.className}
      style={{ background: "#000000" }}
    >
      <body>{props.children}</body>
    </html>
  );
}
