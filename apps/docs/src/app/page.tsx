import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
      </main>
    </>
  );
}
