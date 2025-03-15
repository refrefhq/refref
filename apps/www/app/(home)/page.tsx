import { Hero } from "@/components/ui/hero";
import FaqGeneral from "@/components/ui/faq-general";
import Cta1 from "@/components/ui/cta-1";
import { ValueProp } from "@/components/ui/value-prop";
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <ValueProp />
      <FaqGeneral />
      <Cta1 />
    </main>
  );
}
