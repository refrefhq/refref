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
      description: "Lower CAC than paid ads—referral customers cost significantly less.",
      source: "HubSpot",
    },
    {
      value: "3X",
      description: "Higher LTV – Referred customers are more loyal and spend more.",
      source: "Harvard Business Review",
    },
  ];

  return (
    <section className="py-10 md:py-32 mt-8">
      <div className="container">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-medium text-gray-900 dark:text-gray-50 sm:text-4xl">
              <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                Unlock a Self-Managed, Low-CAC Growth Engine
              </span>
            </h2>
          </div>

          {/* First row: Value Props in Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {valueProps.map((prop, index) => (
              <Card key={index} className="border border-gray-200 dark:border-gray-800">
                <CardContent className="flex flex-col items-center text-center gap-2 py-2 px-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{prop.title}</h3>
                    <p className="text-muted-foreground">{prop.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Second row: Stats without border cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center text-center py-2 px-4">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.description}</p>
                <p className="text-sm text-muted-foreground mt-1">- {stat.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
