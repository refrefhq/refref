import { ArrowDownRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "Cash Rewards – Automate PayPal, Stripe, or manual payouts.",
    image: "https://placehold.co/600x400/3b82f6/ffffff?text=Cash+Rewards",
  },
  {
    title: "Store Credits & Discounts – Drive repeat purchases & engagement.",
    image:
      "https://placehold.co/600x400/6366f1/ffffff?text=Store+Credits+%26+Discounts",
  },
  {
    title: "Physical Goods – Offer exclusive merchandise or gifts.",
    image: "https://placehold.co/600x400/8b5cf6/ffffff?text=Physical+Goods",
  },
];

const FeatureRewardTypes = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        {/* Content */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-8 lg:mt-16 lg:grid-cols-2">
          <h2 className="text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
            <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
              Multiple Reward Types
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Choose from multiple reward types to suit your needs. Integrate with
            your different systems to support your reward types.
          </p>
        </div>

        {/* Features Card */}
        <Card className="mt-12 overflow-hidden rounded-xl md:mt-16 lg:mt-20">
          <CardContent className="flex p-0 max-lg:flex-col">
            {items.map((item, i) => (
              <div key={i} className="flex flex-1 max-lg:flex-col">
                <div className="ps-6 pt-6 lg:ps-8 lg:pt-8">
                  <div className="relative ps-4">
                    <img
                      src={item.image}
                      alt={`${item.title} interface`}
                      className="aspect-[1.28/1] overflow-hidden rounded-tl-xl object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </div>
                  <a
                    href="/docs"
                    className="group flex items-center justify-between gap-4 p-6 !ps-0 lg:p-8"
                  >
                    <div>
                      <h3 className="text-xl font-medium leading-tight">
                        {item.title.split("–")[0]?.trim() || item.title}
                      </h3>
                      {item.title.includes("–") && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.title.split("–").slice(1).join("–").trim()}
                        </p>
                      )}
                    </div>
                    <ArrowDownRight className="size-6" />
                  </a>
                </div>
                {i < items.length - 1 && (
                  <div className="relative hidden lg:block">
                    <DashedLine orientation="vertical" />
                  </div>
                )}
                {i < items.length - 1 && (
                  <div className="relative block lg:hidden">
                    <DashedLine orientation="horizontal" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { FeatureRewardTypes };

interface DashedLineProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const DashedLine = ({
  orientation = "horizontal",
  className,
}: DashedLineProps) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "relative text-muted-foreground",
        isHorizontal ? "h-px w-full" : "h-full w-px",
        className,
      )}
    >
      <div
        className={cn(
          isHorizontal
            ? [
                "h-px w-full",
                "bg-[repeating-linear-gradient(90deg,transparent,transparent_4px,currentColor_4px,currentColor_10px)]",
                "[mask-image:linear-gradient(90deg,transparent,black_25%,black_45%,transparent)]",
              ]
            : [
                "h-full w-px",
                "bg-[repeating-linear-gradient(180deg,transparent,transparent_4px,currentColor_4px,currentColor_8px)]",
                "[mask-image:linear-gradient(180deg,transparent,black_25%,black_45%,transparent)]",
              ],
        )}
      />
    </div>
  );
};
