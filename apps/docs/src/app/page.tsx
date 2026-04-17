import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";
import { LiveShowcase } from "../components/landing/LiveShowcase";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <LiveShowcase />
      </main>
    </>
  );
}
