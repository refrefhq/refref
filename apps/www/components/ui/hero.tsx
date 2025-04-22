"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";

export function Hero() {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowSuccess(urlParams.get('submission') === 'true' && urlParams.get('form_type') === 'demo');
  }, []);

  return (
    <section className="relative pt-16 md:pt-24">
      <div className="container relative">
        <div className="magicpattern absolute inset-x-0 top-0 -z-10 flex h-full w-full items-center justify-center opacity-100" />
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="z-10 flex flex-col items-center gap-6 text-center">
            <div>
              <h2 className="mb-6 text-center text-3xl font-medium text-gray-900 dark:text-gray-50 sm:text-6xl">
                <Link href="https://github.com/refrefhq/refref" target="_blank" rel="noopener noreferrer" className="inline-block mb-6">
                  <AnimatedGradientText>⭐ Star us on Github</AnimatedGradientText>
                </Link>{' '}
                <span className="animate-text-gradient inline-flex bg-gradient-to-r from-neutral-900 via-slate-500 to-neutral-500 bg-[200%_auto] bg-clip-text leading-tight text-transparent dark:from-neutral-100 dark:via-slate-400 dark:to-neutral-400">
                  Open Source Referral Marketing
                </span>
              </h2>
              <p className="text-muted-foreground lg:text-xl">
                Build powerful referral programs with RefRef's free, community-driven platform. Track referrals, automate rewards, and grow your user base through word-of-mouth marketing.
              </p>
            </div>
            <div className="mt-4 w-full max-w-md">
              <div className="flex justify-center gap-4">
                <Button className="bg-primary hover:bg-primary/90">
                  <Link href="https://github.com/refrefhq/refref">Get Started</Link>
                </Button>
                <Button variant="outline">
                  <Link href="/docs">Docs</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-16 w-full">
            <div className="relative p-[1px] rounded-xl z-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500 to-green-500 opacity-75 blur"></div>
              <img
                src="/webapp-home-1.png"
                alt="RefRef Interface"
                className="relative block h-full w-full rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Request Received!</h3>
              <p className="text-muted-foreground">Thank you for your interest in RefRef. We'll get back to you shortly.</p>
            </div>
            <Button onClick={() => setShowSuccess(false)} className="mt-2">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}