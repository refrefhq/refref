import { Hero } from "@/components/ui/hero";
import FaqGeneral from "@/components/ui/faq-general";
import Cta1 from "@/components/ui/cta-1";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <FaqGeneral />
      <Cta1 />
    </main>
  );
}
