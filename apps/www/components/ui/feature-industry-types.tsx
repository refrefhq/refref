import {
  Code,
  GitBranch,
  List,
  Play,
  Sparkles,
  WandSparkles,
  LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

// Define the card content array
const industryCards = [
  {
    title: "B2B SaaS",
    description:
      "Drive growth with partner and customer referral programs for your SaaS platform.",
    imageSrc: "https://placehold.co/600x400/3b82f6/ffffff?text=B2B+SaaS",
  },
  {
    title: "B2C Subscription",
    description:
      "Increase subscriber acquisition with viral referral campaigns that reward loyal customers.",
    imageSrc:
      "https://placehold.co/600x400/6366f1/ffffff?text=B2C+Subscription",
  },
  {
    title: "FinTech",
    description:
      "Secure, compliant referral solutions tailored for financial technology companies.",
    imageSrc: "https://placehold.co/600x400/8b5cf6/ffffff?text=FinTech",
  },
  {
    title: "Marketplaces",
    description:
      "Two-sided referral programs that grow both your supply and demand sides simultaneously.",
    imageSrc: "https://placehold.co/600x400/ec4899/ffffff?text=Marketplaces",
  },
  {
    title: "Online Education",
    description:
      "Expand your student base with referral programs that reward learning communities.",
    imageSrc:
      "https://placehold.co/600x400/f59e0b/ffffff?text=Online+Education",
  },
  {
    title: "ECommerce & D2C",
    description:
      "Turn customers into advocates with referral programs that boost direct sales and brand loyalty.",
    imageSrc:
      "https://placehold.co/600x400/10b981/ffffff?text=ECommerce+%26+D2C",
  },
];

const FeatureIndustryTypes = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mb-24 flex flex-col items-center gap-6">
          <h1 className="text-center text-3xl font-semibold lg:max-w-3xl lg:text-5xl">
            Support For Every Business Model
          </h1>
          <p className="text-center text-lg font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
            RefRef provides tailored referral solutions for a wide range of
            industries, helping businesses of all types grow through
            word-of-mouth marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 place-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {industryCards.map((card, index) => {
            return (
              <Link href="/docs" key={index} className="w-full">
                <Card className="h-full transition-all hover:shadow-md">
                  <CardHeader className="pb-2 text-left">
                    <h2 className="text-lg font-semibold">{card.title}</h2>
                  </CardHeader>
                  <CardContent className="pt-0 text-left">
                    <p className="leading-snug text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                  <CardFooter className="justify-end pr-0 pb-0">
                    <img
                      className="h-40 w-full rounded-tl-md object-cover object-center"
                      src={card.imageSrc}
                      alt={card.title}
                    />
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { FeatureIndustryTypes };
