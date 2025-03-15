import { Button } from "@/components/ui/button";

interface Feature {
  image: string;
  title: string;
  description: string;
}

interface Timeline3Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary: {
      text: string;
      url: string;
    };
    secondary: {
      text: string;
      url: string;
    };
  };
  features?: Feature[];
}

const SetupSteps = ({
  heading = "Setup in 3 easy steps",
  description = "We've strive to make RefRef easy to setup while being powerful to customise",
  buttons = {
    primary: {
      text: "Get Started",
      url: "/github",
    },
    secondary: {
      text: "See Docs",
      url: "/docs",
    },
  },
  features = [
    {
      image: "https://placehold.co/800x400/3b82f6/ffffff?text=Add+RefRef+to+your+website",
      title: "Add RefRef to your website",
      description:
        "Add RefRef to your website by adding a simple script to your website.",
    },
    {
      image: "https://placehold.co/800x400/6366f1/ffffff?text=Setup+your+Program",
      title: "Setup your Program in the RefRef app",
      description:
        "Customise your Referral Program to your liking, with a range of options to choose from.",
    },
    {
      image: "https://placehold.co/800x400/8b5cf6/ffffff?text=Setup+Reward+Integrations",
      title: "Setup your reward integrations",
      description: "Connect your RefRef to your reward integrations to automate disbursements.",
    },
    {
      image: "https://placehold.co/800x400/ec4899/ffffff?text=That's+it!",
      title: "That's it!",
      description: "Your users can get their refrreal link wiht a click of the button and track their referral and reward status in app",
    },
  ],
}: Timeline3Props) => {
  return (
    <section className="py-32">
      <div className="container max-w-6xl">
        <div className="relative grid gap-16 md:grid-cols-2">
          <div className="top-40 h-fit md:sticky">
            <h2 className="mb-6 mt-4 text-3xl font-medium text-gray-900 dark:text-gray-50 md:text-4xl lg:text-5xl">
              <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                {heading}
              </span>
            </h2>
            <p className="font-medium text-muted-foreground md:text-xl">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-4 lg:flex-row">
              <Button className="gap-2" size="lg" asChild>
                <a href={buttons.primary.url}>{buttons.primary.text}</a>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-12 md:gap-20">
            {features.map((feature, index) => (
              <div key={index} className="rounded-xl border p-2">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="aspect-video w-full rounded-xl border border-dashed object-cover"
                />
                <div className="p-6">
                  <h3 className="mb-1 text-2xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { SetupSteps };
