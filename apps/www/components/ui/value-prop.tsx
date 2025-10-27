"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Gift, Settings } from "lucide-react";

export function ValueProp() {
  const valueProps = [
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Reduce dependency on expensive ads",
      description: "Turn customers into advocates.",
    },
    {
      icon: <Gift className="h-6 w-6 text-primary" />,
      title: "Automate tracking, attribution, and payouts",
      description: "Streamline your referral program operations.",
    },
    {
      icon: <Settings className="h-6 w-6 text-primary" />,
      title: "Full control with self-hosting or cloud deployment",
      description: "Choose the deployment option that works for you.",
    },
  ];

  const stats = [
    {
      value: "82%",
      description: "of consumers trust referrals from people they know.",
      source: "Nielsen",
    },
    {
      value: "5X",
      description:
        "Lower CAC than paid ads - referral customers cost significantly less.",
      source: "HubSpot",
    },
    {
      value: "3X",
      description:
        "Higher LTV - Referred customers are more loyal and spend more.",
      source: "Harvard Business Review",
    },
  ];

  return (
    <section className="py-20 md:py-32 mt-16 md:mt-8">
      <div className="container">
        {/* First section: Header and value props in a 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {/* Left column: Header and description */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 text-3xl font-medium text-gray-900 dark:text-gray-50 sm:text-5xl">
              <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                Unlock a Self-driving, Low-CAC Growth Engine
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Turn your customers into advocates and grow your business with a
              powerful referral program.
            </p>
          </div>

          {/* Right column: Value props in cards */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-md">
              {valueProps.map((prop, index) => (
                <Card
                  key={index}
                  className="border border-gray-200 dark:border-gray-800"
                >
                  <CardContent className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-md font-medium leading-none">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {prop.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Stats section with separator */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col">
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  - {stat.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
