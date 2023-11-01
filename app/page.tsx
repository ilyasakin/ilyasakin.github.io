import { Metadata } from 'next'
import HomePage from "./home-page";

export const metadata: Metadata = {
  title: 'Ilyas Akin',
}

export default function Page() {
  return <HomePage/>
}