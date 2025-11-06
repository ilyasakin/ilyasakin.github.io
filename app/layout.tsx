import { ReactNode } from "react";
import "../styles/globals.css";
import { JetBrains_Mono } from "next/font/google";
import { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ViewTransitions } from "next-view-transitions";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | İlyas Akın",
    default: "İlyas Akın - Senior Full-Stack Web Developer",
  },
  description:
    "Senior full-stack web developer crafting code at Kuika Software. Blog posts about web development, software engineering, and technology.",
  keywords: [
    "web development",
    "full-stack",
    "software engineering",
    "React",
    "Node.js",
    "TypeScript",
    "blog",
  ],
  authors: [{ name: "İlyas Akın" }],
  creator: "İlyas Akın",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en" className={jetbrainsMono.className}>
        <body>
          {children}
          <SpeedInsights />
        </body>
      </html>
    </ViewTransitions>
  );
}
