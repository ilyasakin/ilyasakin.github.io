import { ReactNode } from "react";
import "../styles/globals.css";
import { JetBrains_Mono } from "next/font/google";
import { Metadata } from 'next'

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | İlyas Akın',
    default: 'İlyas Akın - Senior Full-Stack Web Developer'
  },
  description: 'Senior full-stack web developer crafting code at Kuika Software. Blog posts about web development, software engineering, and technology.',
  keywords: ['web development', 'full-stack', 'software engineering', 'React', 'Node.js', 'TypeScript', 'blog'],
  authors: [{ name: 'İlyas Akın' }],
  creator: 'İlyas Akın',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ilyasakin.dev',
    siteName: 'İlyas Akın',
    title: 'İlyas Akın - Senior Full-Stack Web Developer',
    description: 'Senior full-stack web developer crafting code at Kuika Software. Blog posts about web development, software engineering, and technology.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İlyas Akın - Senior Full-Stack Web Developer',
    description: 'Senior full-stack web developer crafting code at Kuika Software. Blog posts about web development, software engineering, and technology.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  verification: {
    google: 'your-google-site-verification', // Add your Google verification code
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.className}>
      <body>
        {children}
      </body>
    </html>
  );
}