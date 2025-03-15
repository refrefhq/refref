import { Code, GitBranch, List, Sparkles, Target, Cookie, Gift, Layout, ShieldCheck, Network, BarChart3, Share2, Users, Star, Bell, CreditCard } from "lucide-react";

const features = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "Advanced Attribution",
    text: "Track the full customer journey with first-touch, last-touch, and multi-touch attribution models.",
  },
  {
    icon: <Cookie className="h-5 w-5" />,
    title: "Seamless Tracking",
    text: "Let referrers track their referral status and rewards.",
  },
  {
    icon: <Gift className="h-5 w-5" />,
    title: "Custom Rewards",
    text: "Design flexible reward structures with cash payouts, store credits, discount codes, or physical products.",
  },
  {
    icon: <Layout className="h-5 w-5" />,
    title: "Personalized Pages",
    text: "Create branded referral pages for each participant with unique tracking links and custom messaging.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Fraud Prevention",
    text: "Prevent abuse of your program with fraud monitoring rules.",
  },
  {
    icon: <Network className="h-5 w-5" />,
    title: "Multi-Tier Programs",
    text: "Build viral growth with cascading rewards that incentivize both direct and indirect referrals.",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Program Analytics",
    text: "Access real-time dashboards showing conversion rates, ROI, and top performers to optimize campaigns.",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "Integrations",
    text: "Connect seamlessly with your tech stack across payment gateways, e-commerce, content platforms, and reward systems.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Affiliate Management",
    text: "Recruit, manage, and track performance of affiliate partners with customizable commission structures.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Reputation Management",
    text: "Grow your online reputation by incentivizing customers to leave reviews in exchange for rewards.",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Intelligent Nudges",
    text: "Send automated, timely reminders via email and in-app notifications to encourage referral participation.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Automatic Rewarding",
    text: "Seamlessly disburse rewards through integration with your application and payment systems.",
  },
];

const FeatureListGeneral = () => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Full featured Referral Management Platform
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            Everything you need to manage and grow your referral program in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-between pb-16">
          {features.map((item, index, arr) => (
            <div
              key={index}
              className="flex flex-shrink flex-grow basis-full flex-col items-start justify-between p-6 md:basis-1/2 lg:basis-1/4"
            >
              <div className="mb-3 flex items-center justify-start gap-3">
                {item.icon}
                <h1 className="text-lg font-semibold">{item.title}</h1>
              </div>
              <p className="text-sm text-muted-foreground/50">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { FeatureListGeneral };
