interface Feature {
  title: string;
  description: string;
  image: string;
}

interface FeatureBento1Props {
  heading?: string;
  description?: string;
  feature1?: Feature;
  feature2?: Feature;
  feature3?: Feature;
  feature4?: Feature;
}

const FeatureBento1 = ({
  heading = "Core Platform Features",
  description = "RefRef is built with the following core features to help you get started with your referral program.",
  feature1 = {
    title: "Advanced Attribution",
    description:
      "First-touch, last-touch, multi-touch tracking.",
    image: "https://placehold.co/800x400/3b82f6/ffffff?text=Advanced+Attribution",
  },
  feature2 = {
    title: "Seamless Tracking",
    description:
      "Let referrers track their own referral status.",
    image: "https://placehold.co/600x400/6366f1/ffffff?text=Seamless+Tracking",
  },
  feature3 = {
    title: "Custom Rewards",
    description:
      "Offer cash, store credits, discounts, or physical goods.",
    image: "https://placehold.co/600x400/8b5cf6/ffffff?text=Custom+Rewards",
  },
  feature4 = {
    title: "Personalized Landing Pages",
    description:
      "Auto-generate unique referral pages that are personalized to your referrers",
    image: "https://placehold.co/800x400/ec4899/ffffff?text=Personalized+Landing+Pages",
  },
}: FeatureBento1Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mb-24 flex flex-col items-center gap-6">
          <h1 className="text-center text-3xl font-semibold lg:max-w-3xl lg:text-5xl">
            {heading}
          </h1>
          <p className="text-center text-lg font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
            {description}
          </p>
        </div>
        <div className="relative flex justify-center">
          <div className="relative flex w-full flex-col border border-muted2 rounded-xl overflow-hidden md:w-1/2 lg:w-full">
            <div className="relative flex flex-col lg:flex-row">
              <div className="flex flex-col justify-between border-b border-solid border-muted2 p-10 lg:w-3/5 lg:border-b-0 lg:border-r">
                <h2 className="text-xl font-semibold">{feature1.title}</h2>
                <p className="text-muted-foreground">{feature1.description}</p>
                <img
                  src={feature1.image}
                  alt={feature1.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover rounded-lg lg:aspect-[2.4]"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-2/5">
                <h2 className="text-xl font-semibold">{feature2.title}</h2>
                <p className="text-muted-foreground">{feature2.description}</p>
                <img
                  src={feature2.image}
                  alt={feature2.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="relative flex flex-col border-t border-solid border-muted2 lg:flex-row">
              <div className="flex flex-col justify-between border-b border-solid border-muted2 p-10 lg:w-2/5 lg:border-b-0 lg:border-r">
                <h2 className="text-xl font-semibold">{feature3.title}</h2>
                <p className="text-muted-foreground">{feature3.description}</p>
                <img
                  src={feature3.image}
                  alt={feature3.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-lg"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-3/5">
                <h2 className="text-xl font-semibold">{feature4.title}</h2>
                <p className="text-muted-foreground">{feature4.description}</p>
                <img
                  src={feature4.image}
                  alt={feature4.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover rounded-lg lg:aspect-[2.4]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { FeatureBento1 };
