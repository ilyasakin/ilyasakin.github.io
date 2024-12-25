import { ReactNode } from "react";
import "../styles/globals.css";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.className}>
      <body>
        {children}
      </body>
    </html>
  );
}