"use client"

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import OverlappingReferralWidgets from "./overlapping-referral-widgets"

export function Hero2() {
  return (
    <section className="relative pt-12 md:pt-0 min-h-[800px]">
      <div className="container relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Hero text */}
          <div className="lg:col-span-5 z-10 flex flex-col items-start gap-6">
            <div>
              <h2 className="mb-6 text-3xl font-medium text-gray-50 sm:text-6xl">
                <Link href="https://github.com/refrefhq/refref" target="_blank" rel="noopener noreferrer" className="inline-block mb-6">
                  <AnimatedGradientText>⭐ Star us on Github</AnimatedGradientText>
                </Link>{' '}
                <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-100 via-slate-400 to-neutral-400 bg-[200%_auto] bg-clip-text leading-tight text-transparent">
                  Open Source Referral Management
                </span>
              </h2>
              <p className="text-zinc-400 lg:text-xl">
                Build powerful referral programs with RefRef's free, community-driven platform. Track referrals, automate rewards, and grow your user base through word-of-mouth marketing.
              </p>
            </div>
            <div className="mt-4 w-full">
              <div className="flex gap-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Link href="https://github.com/refrefhq/refref">Get Started</Link>
                </Button>
                <Button variant="outline">
                  <Link href="/docs">Docs</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Overlapping Referral Widgets */}
          <div className="lg:col-span-7 relative w-full">
            <OverlappingReferralWidgets />
          </div>
        </div>
      </div>
    </section>
  )
}
