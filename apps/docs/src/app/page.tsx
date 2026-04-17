import { Header } from "../components/chrome/Header";
import { Hero } from "../components/landing/Hero";
import { ValueProps } from "../components/landing/ValueProps";
import { LiveShowcase } from "../components/landing/LiveShowcase";
import { Comparison } from "../components/landing/Comparison";
import { InstallSnippet } from "../components/landing/InstallSnippet";
import { Footer } from "../components/landing/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <LiveShowcase />
        <Comparison />
        <InstallSnippet />
      </main>
      <Footer />
    </>
  );
}
