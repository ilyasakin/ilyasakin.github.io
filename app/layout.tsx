import { Metadata } from 'next'
import '../styles/globals.css'
import { JetBrains_Mono } from 'next/font/google'

export const metadata: Metadata = {
  title: 'Ilyas Akin',
  description: 'Personal website of Ilyas Akin',
}

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: "700",
  style: "normal"
});

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jetbrainsMono.className}>
      <body>{children}</body>
    </html>
  )
}