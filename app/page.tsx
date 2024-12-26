import { Metadata } from "next";
import HomePage from "./home-page";
import PageTransition from "../components/transitions/page-transition";

export const metadata: Metadata = {
  title: "Ilyas Akin",
};

export default function Page() {
  return (
    <PageTransition>
      <HomePage />
    </PageTransition>
  );
}
