import {
  GitPullRequest,
  RadioTower,
  WandSparkles,
} from "lucide-react";

interface Reason {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature43Props {
  heading?: string;
  reasons?: Reason[];
}

const WhyOSS = ({
  heading = "Why Open-Source?",
  reasons = [
    {
      title: "Free & Customizable",
      description:
        "Free to use and fully customizable to meet your specific needs and requirements.",
      icon: <WandSparkles className="size-6" />,
    },
    {
      title: "No Vendor Lock-in",
      description:
        "Host on your own servers with complete control over your infrastructure and data.",
      icon: <RadioTower className="size-6" />,
    },
    {
      title: "Community-Driven",
      description:
        "Transparent development process with innovations driven by the community's needs.",
      icon: <GitPullRequest className="size-6" />,
    },
  ],
}: Feature43Props) => {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-medium text-center">
            <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
              {heading}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {reasons.map((reason, i) => (
            <div key={i} className="flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                {reason.icon}
              </div>
              <h3 className="mb-2 text-xl font-medium">{reason.title}</h3>
              <p className="text-base text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { WhyOSS };
