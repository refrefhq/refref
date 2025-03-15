import { Hero } from "@/components/ui/hero";
import FaqGeneral from "@/components/ui/faq-general";
import Cta1 from "@/components/ui/cta-1";
import { ValueProp } from "@/components/ui/value-prop";
import { WhyOSS } from "@/components/ui/why-oss";
import { FeatureBento1 } from "@/components/ui/feature-bento-1";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ValueProp />
      <WhyOSS />
      <FeatureBento1 />
      <FaqGeneral />
      <Cta1 />
    </main>
  );
}
